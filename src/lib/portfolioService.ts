
import { supabase } from './supabase';

import {
  DEFAULT_CATEGORIES,
  DEFAULT_PHILOSOPHY,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_TESTIMONIALS,
} from '../data/seedPortfolio';

import {
  sanitizeInquiryInput,
  sanitizeProjectInput,
  sanitizeSiteSettingsInput,
  slugify,
} from './portfolioLogic';

import type {
  ActivityLog,
  Category,
  ContactFormInput,
  Inquiry,
  MediaAsset,
  PhilosophyItem,
  Project,
  ProjectGalleryItem,
  ServiceItem,
  SiteSettings,
  StatItem,
  Testimonial,
} from '../types/portfolio';

export interface PublicPortfolioState {
  settings: SiteSettings;
  projects: Project[];
  categories: Category[];
  philosophy: PhilosophyItem[];
  services: ServiceItem[];
  stats: StatItem[];
  testimonials: Testimonial[];
  loadedFromFirestore: boolean;
}

export interface AdminCMSState extends PublicPortfolioState {
  media: MediaAsset[];
  inquiries: Inquiry[];
  activities: ActivityLog[];
}

// --------------------------------------------------
// Helper functions
// --------------------------------------------------

type DatabaseRow = Record<string, any>;

function formatTimestamp(value: unknown): string | undefined {
  if (!value) return undefined;

  if (typeof value === 'string') {
    return value;
  }

  return undefined;
}

function makeId(): string {
  return crypto.randomUUID();
}

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

function getArray(value: unknown): DatabaseRow[] {
  return Array.isArray(value) ? value : [];
}

function mapCategory(item: DatabaseRow): Category {
  return {
    id: String(item.id ?? makeId()),
    name: String(item.name ?? ''),
    slug: String(item.slug ?? ''),
    displayOrder: Number(item.displayOrder ?? item.sort_order ?? 0),
    updatedAt: formatTimestamp(item.updatedAt ?? item.updated_at),
  };
}

function mapPhilosophy(item: DatabaseRow): PhilosophyItem {
  return {
    id: String(item.id ?? makeId()),
    number: String(item.number ?? ''),
    title: String(item.title ?? ''),
    description: String(item.description ?? ''),
    displayOrder: Number(item.displayOrder ?? item.sort_order ?? 0),
    updatedAt: formatTimestamp(item.updatedAt ?? item.updated_at),
  };
}

function mapStat(item: DatabaseRow): StatItem {
  return {
    id: String(item.id ?? makeId()),
    label: String(item.label ?? ''),
    value: Number(item.value ?? 0),
    suffix: String(item.suffix ?? ''),
    context: String(item.context ?? ''),
    displayOrder: Number(item.displayOrder ?? item.sort_order ?? 0),
    updatedAt: formatTimestamp(item.updatedAt ?? item.updated_at),
  };
}

function mapProjectImage(item: DatabaseRow): ProjectGalleryItem {
  return {
    url: String(item.image_url ?? ''),
    alt: String(item.alt_text ?? ''),
    caption: String(item.caption ?? ''),
  };
}

function mapProject(
  item: DatabaseRow,
  gallery: ProjectGalleryItem[] = []
): Project {
  return {
    id: String(item.id),
    title: String(item.title ?? ''),
    slug: String(item.slug ?? ''),
    category: String(item.category ?? ''),
    location: String(item.location ?? ''),
    year: String(item.year ?? ''),
    summary: String(item.summary ?? ''),
    description: String(item.description ?? ''),
    area: String(item.area ?? ''),
    client: String(item.client ?? ''),
    thumbnailUrl: String(item.cover_image ?? ''),
    thumbnailAlt: String(item.thumbnail_alt ?? ''),
    gallery,
    published: Boolean(item.published),
    featured: Boolean(item.featured),
    displayOrder: Number(item.sort_order ?? 0),
    createdAt: formatTimestamp(item.created_at),
    updatedAt: formatTimestamp(item.updated_at),
  };
}

function mapService(item: DatabaseRow): ServiceItem {
  return {
    id: String(item.id),
    title: String(item.title ?? ''),
    description: String(item.description ?? ''),
    deliverables: getArray(item.deliverables).map(String),
    displayOrder: Number(item.sort_order ?? 0),
    updatedAt: formatTimestamp(item.updated_at),
  };
}

function mapTestimonial(item: DatabaseRow): Testimonial {
  return {
    id: String(item.id),
    clientName: String(item.client_name ?? ''),
    designation: String(item.client_role ?? ''),
    quote: String(item.content ?? ''),
    avatarUrl: String(item.image_url ?? ''),
    projectRef: String(item.project_ref ?? ''),
    displayOrder: Number(item.sort_order ?? 0),
    updatedAt: formatTimestamp(item.updated_at),
  };
}

function mapMediaAsset(item: DatabaseRow): MediaAsset {
  return {
    id: String(item.id),
    name: String(item.name ?? ''),
    url: String(item.url ?? ''),
    alt: String(item.alt ?? ''),
    width: Number(item.width ?? 0),
    height: Number(item.height ?? 0),
    sizeKb: Number(item.size_kb ?? 0),
    originalSizeKb: Number(item.original_size_kb ?? 0),
    mimeType: String(item.mime_type ?? ''),
    createdAt: formatTimestamp(item.created_at),
    updatedAt: formatTimestamp(item.updated_at),
  };
}

function mapInquiry(item: DatabaseRow): Inquiry {
  return {
    id: String(item.id),
    name: String(item.name ?? ''),
    email: String(item.email ?? ''),
    projectType: String(item.project_type ?? ''),
    budgetRange: String(item.budget_range ?? ''),
    message: String(item.message ?? ''),
    status: item.status === 'read' ? 'read' : 'unread',
    createdAt: formatTimestamp(item.created_at),
  };
}

function mapActivity(item: DatabaseRow): ActivityLog {
  return {
    id: String(item.id),
    action: String(item.action ?? ''),
    entityType: String(item.entity_type ?? ''),
    summary: String(item.summary ?? ''),
    actorEmail: String(item.actor_email ?? ''),
    createdAt: formatTimestamp(item.created_at),
  };
}

async function fetchProjectGallery(
  projectIds: string[]
): Promise<Record<string, ProjectGalleryItem[]>> {
  if (projectIds.length === 0) return {};

  const { data, error } = await supabase
    .from('project_images')
    .select('*')
    .in('project_id', projectIds)
    .order('sort_order', { ascending: true });

  throwIfError(error);

  const galleryByProject: Record<string, ProjectGalleryItem[]> = {};

  for (const item of data ?? []) {
    const projectId = String(item.project_id);

    if (!galleryByProject[projectId]) {
      galleryByProject[projectId] = [];
    }

    galleryByProject[projectId].push(mapProjectImage(item));
  }

  return galleryByProject;
}

async function fetchSiteContent(
  sectionKey: string
): Promise<DatabaseRow[]> {
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('section_key', sectionKey)
    .maybeSingle();

  throwIfError(error);

  return getArray(data?.content);
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value, updated_at')
    .eq('setting_key', 'studio')
    .maybeSingle();

  throwIfError(error);

  if (!data?.setting_value) {
    return DEFAULT_SITE_SETTINGS;
  }

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...data.setting_value,
    id: 'studio',
    updatedAt: formatTimestamp(data.updated_at),
  } as SiteSettings;
}

// --------------------------------------------------
// Public portfolio data
// --------------------------------------------------

export function subscribePublicPortfolio(
  onUpdate: (state: PublicPortfolioState) => void,
  onError?: (err: Error) => void
): () => void {
  let active = true;

  const loadData = async () => {
    try {
      const [
        settings,
        projectResult,
        categoryItems,
        philosophyItems,
        serviceResult,
        statItems,
        testimonialResult,
      ] = await Promise.all([
        fetchSiteSettings(),

        supabase
          .from('projects')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true }),

        fetchSiteContent('categories'),
        fetchSiteContent('philosophy'),

        supabase
          .from('services')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true }),

        fetchSiteContent('stats'),

        supabase
          .from('testimonials')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true }),
      ]);

      throwIfError(projectResult.error);
      throwIfError(serviceResult.error);
      throwIfError(testimonialResult.error);

      const projectRows = projectResult.data ?? [];
      const galleryMap = await fetchProjectGallery(
        projectRows.map((item) => String(item.id))
      );

      const state: PublicPortfolioState = {
        settings,
        projects: projectRows.map((item) =>
          mapProject(item, galleryMap[String(item.id)] ?? [])
        ),
        categories: categoryItems.length
          ? categoryItems.map(mapCategory)
          : DEFAULT_CATEGORIES,
        philosophy: philosophyItems.length
          ? philosophyItems.map(mapPhilosophy)
          : DEFAULT_PHILOSOPHY,
        services: serviceResult.data?.length
          ? serviceResult.data.map(mapService)
          : DEFAULT_SERVICES,
        stats: statItems.length
          ? statItems.map(mapStat)
          : DEFAULT_STATS,
        testimonials: testimonialResult.data?.length
          ? testimonialResult.data.map(mapTestimonial)
          : DEFAULT_TESTIMONIALS,
        loadedFromFirestore: true,
      };

      if (active) onUpdate(state);
    } catch (error) {
      if (active) {
        onError?.(
          error instanceof Error
            ? error
            : new Error('Unable to load portfolio data.')
        );
      }
    }
  };

  void loadData();

  return () => {
    active = false;
  };
}

// --------------------------------------------------
// Admin CMS data
// --------------------------------------------------

export function subscribeAdminCMS(
  onUpdate: (state: AdminCMSState) => void,
  onError?: (err: Error) => void
): () => void {
  let active = true;

  const loadData = async () => {
    try {
      const [
        settings,
        projectResult,
        categoryItems,
        philosophyItems,
        serviceResult,
        statItems,
        testimonialResult,
        mediaResult,
        inquiryResult,
        activityResult,
      ] = await Promise.all([
        fetchSiteSettings(),

        supabase
          .from('projects')
          .select('*')
          .order('sort_order', { ascending: true }),

        fetchSiteContent('categories'),
        fetchSiteContent('philosophy'),

        supabase
          .from('services')
          .select('*')
          .order('sort_order', { ascending: true }),

        fetchSiteContent('stats'),

        supabase
          .from('testimonials')
          .select('*')
          .order('sort_order', { ascending: true }),

        supabase
          .from('media_assets')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(25),
      ]);

      throwIfError(projectResult.error);
      throwIfError(serviceResult.error);
      throwIfError(testimonialResult.error);
      throwIfError(mediaResult.error);
      throwIfError(inquiryResult.error);
      throwIfError(activityResult.error);

      const projectRows = projectResult.data ?? [];
      const galleryMap = await fetchProjectGallery(
        projectRows.map((item) => String(item.id))
      );

      const state: AdminCMSState = {
        settings,
        projects: projectRows.map((item) =>
          mapProject(item, galleryMap[String(item.id)] ?? [])
        ),
        categories: categoryItems.map(mapCategory),
        philosophy: philosophyItems.map(mapPhilosophy),
        services: (serviceResult.data ?? []).map(mapService),
        stats: statItems.map(mapStat),
        testimonials: (testimonialResult.data ?? []).map(mapTestimonial),
        media: (mediaResult.data ?? []).map(mapMediaAsset),
        inquiries: (inquiryResult.data ?? []).map(mapInquiry),
        activities: (activityResult.data ?? []).map(mapActivity),
        loadedFromFirestore: true,
      };

      if (active) onUpdate(state);
    } catch (error) {
      if (active) {
        onError?.(
          error instanceof Error
            ? error
            : new Error('Unable to load admin CMS data.')
        );
      }
    }
  };

  void loadData();

  return () => {
    active = false;
  };
}
// ==========================================
// PART 2A — CONTENT HELPERS, ACTIVITY LOGS,
// SEEDING, INQUIRIES, SITE SETTINGS & PROJECTS
// ==========================================

type ContentSection =
  | 'categories'
  | 'philosophy'
  | 'stats';

async function saveSiteContentArray(
  sectionKey: ContentSection,
  content: unknown[]
): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from('site_content')
    .select('id')
    .eq('section_key', sectionKey)
    .maybeSingle();

  throwIfError(selectError);

  if (existing) {
    const { error } = await supabase
      .from('site_content')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    throwIfError(error);
  } else {
    const { error } = await supabase
      .from('site_content')
      .insert({
        section_key: sectionKey,
        content,
        updated_at: new Date().toISOString(),
      });

    throwIfError(error);
  }
}

async function updateSiteContentItem(
  sectionKey: ContentSection,
  item: { id: string }
): Promise<void> {
  const { data, error } = await supabase
    .from('site_content')
    .select('id, content')
    .eq('section_key', sectionKey)
    .maybeSingle();

  throwIfError(error);

  const currentItems = getArray(data?.content);
  const itemIndex = currentItems.findIndex(
    (existing: { id?: string }) => existing.id === item.id
  );

  if (itemIndex >= 0) {
    currentItems[itemIndex] = item;
  } else {
    currentItems.push(item);
  }

  await saveSiteContentArray(sectionKey, currentItems);
}

async function removeSiteContentItem(
  sectionKey: ContentSection,
  itemId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('site_content')
    .select('id, content')
    .eq('section_key', sectionKey)
    .maybeSingle();

  throwIfError(error);

  if (!data) return;

  const currentItems = getArray(data.content);
  const updatedItems = currentItems.filter(
    (item: { id?: string }) => item.id !== itemId
  );

  await saveSiteContentArray(sectionKey, updatedItems);
}

// ------------------------------------------
// ACTIVITY LOG
// ------------------------------------------

export async function logActivity(
  action: string,
  entityType: string,
  summary: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('activity_logs').insert({
    action,
    entity_type: entityType,
    summary,
    actor_email: user?.email ?? '',
  });

  throwIfError(error);
}

// ------------------------------------------
// SEED DEFAULT DATA
// ------------------------------------------

export async function seedFirestoreIfEmpty(
  actorEmail = ''
): Promise<boolean> {
  const { data: existingSettings, error: settingsError } = await supabase
    .from('site_settings')
    .select('id')
    .eq('setting_key', 'studio')
    .maybeSingle();

  throwIfError(settingsError);

  if (existingSettings) {
    return false;
  }

  const { error: insertSettingsError } = await supabase
    .from('site_settings')
    .insert({
      setting_key: 'studio',
      setting_value: DEFAULT_SITE_SETTINGS,
      updated_at: new Date().toISOString(),
    });

  throwIfError(insertSettingsError);

  await saveSiteContentArray(
    'categories',
    DEFAULT_CATEGORIES as unknown[]
  );

  await saveSiteContentArray(
    'philosophy',
    DEFAULT_PHILOSOPHY as unknown[]
  );

  await saveSiteContentArray(
    'stats',
    DEFAULT_STATS as unknown[]
  );

  // Seed projects and their gallery images.
  for (const project of DEFAULT_PROJECTS) {
    const projectId = makeId();

    const { error: projectError } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        title: project.title,
        slug: project.slug || slugify(project.title),
        category: project.category,
        location: project.location,
        year: project.year,
        summary: project.summary,
        description: project.description,
        area: project.area,
        client: project.client,
        cover_image: project.thumbnailUrl,
        thumbnail_alt: project.thumbnailAlt,
        published: project.published,
        featured: project.featured,
        sort_order: project.displayOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    throwIfError(projectError);

    if (project.gallery?.length) {
      const galleryRows = project.gallery.map((image, index) => ({
        project_id: projectId,
        image_url: image.url,
        alt_text: image.alt,
        caption: image.caption,
        sort_order: index,
      }));

      const { error: galleryError } = await supabase
        .from('project_images')
        .insert(galleryRows);

      throwIfError(galleryError);
    }
  }

  // Seed services.
  if (DEFAULT_SERVICES.length) {
    const serviceRows = DEFAULT_SERVICES.map((service) => ({
      title: service.title,
      description: service.description,
      deliverables: service.deliverables ?? [],
      sort_order: service.displayOrder,
      published: true,
    }));

    const { error } = await supabase
      .from('services')
      .insert(serviceRows);

    throwIfError(error);
  }

  // Seed testimonials.
  if (DEFAULT_TESTIMONIALS.length) {
    const testimonialRows = DEFAULT_TESTIMONIALS.map((testimonial) => ({
      client_name: testimonial.clientName,
      client_role: testimonial.designation,
      content: testimonial.quote,
      image_url: testimonial.avatarUrl,
      project_ref: testimonial.projectRef,
      sort_order: testimonial.displayOrder,
      published: true,
    }));

    const { error } = await supabase
      .from('testimonials')
      .insert(testimonialRows);

    throwIfError(error);
  }

  // Seed media asset metadata.
  if (DEFAULT_MEDIA.length) {
    const mediaRows = DEFAULT_MEDIA.map((asset) => ({
      name: asset.name,
      url: asset.url,
      alt: asset.alt,
      width: asset.width,
      height: asset.height,
      size_kb: asset.sizeKb,
      original_size_kb: asset.originalSizeKb,
      mime_type: asset.mimeType,
    }));

    const { error } = await supabase
      .from('media_assets')
      .insert(mediaRows);

    throwIfError(error);
  }

  await logActivity(
    'seed',
    'system',
    `Initial portfolio data seeded by ${actorEmail || 'admin'}`
  );

  return true;
}

// ------------------------------------------
// PUBLIC INQUIRY
// ------------------------------------------

export async function submitPublicInquiry(
  input: ContactFormInput
): Promise<void> {
  const { error } = await supabase.from('inquiries').insert({
    name: input.name.trim(),
    email: input.email.trim(),
    subject: input.projectType || 'General inquiry',
    message: input.message.trim(),
    project_type: input.projectType,
    budget_range: input.budgetRange,
    status: 'new',
  });

  throwIfError(error);
}

// ------------------------------------------
// SITE SETTINGS
// ------------------------------------------

export async function saveSiteSettings(
  settings: SiteSettings
): Promise<void> {
  const payload = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  // Select first, then update or insert.
  // This does not depend on setting_key being UNIQUE.
  const { data: existing, error: selectError } = await supabase
    .from('site_settings')
    .select('id')
    .eq('setting_key', 'studio')
    .maybeSingle();

  throwIfError(selectError);

  const row = {
    setting_key: 'studio',
    setting_value: payload,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from('site_settings')
      .update(row)
      .eq('id', existing.id);

    throwIfError(error);
  } else {
    const { error } = await supabase
      .from('site_settings')
      .insert(row);

    throwIfError(error);
  }

  await logActivity(
    'update',
    'site_settings',
    'Updated website settings'
  );
}

// ------------------------------------------
// PROJECT CRUD
// ------------------------------------------

export async function createOrUpdateProject(
  project: Project
): Promise<void> {
  const projectId = project.id || makeId();

  const projectRow = {
    title: project.title,
    slug: project.slug || slugify(project.title),
    category: project.category,
    location: project.location,
    year: project.year,
    summary: project.summary,
    description: project.description,
    area: project.area,
    client: project.client,
    cover_image: project.thumbnailUrl,
    thumbnail_alt: project.thumbnailAlt,
    published: project.published,
    featured: project.featured,
    sort_order: project.displayOrder,
    updated_at: new Date().toISOString(),
  };

  if (project.id) {
    const { error } = await supabase
      .from('projects')
      .update(projectRow)
      .eq('id', project.id);

    throwIfError(error);
  } else {
    const { error } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        ...projectRow,
        created_at: new Date().toISOString(),
      });

    throwIfError(error);
  }

  // Replace the project's gallery records.
  const { error: deleteGalleryError } = await supabase
    .from('project_images')
    .delete()
    .eq('project_id', projectId);

  throwIfError(deleteGalleryError);

  if (project.gallery?.length) {
    const galleryRows = project.gallery.map((image, index) => ({
      project_id: projectId,
      image_url: image.url,
      alt_text: image.alt,
      caption: image.caption,
      sort_order: index,
    }));

    const { error: insertGalleryError } = await supabase
      .from('project_images')
      .insert(galleryRows);

    throwIfError(insertGalleryError);
  }

  await logActivity(
    project.id ? 'update' : 'create',
    'project',
    `${project.id ? 'Updated' : 'Created'} project: ${project.title}`
  );
}

export async function toggleProjectPublished(
  projectId: string,
  published: boolean
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  throwIfError(error);

  await logActivity(
    'update',
    'project',
    `${published ? 'Published' : 'Unpublished'} project ${projectId}`
  );
}

export async function updateProjectOrder(
  projectId: string,
  displayOrder: number
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      sort_order: displayOrder,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  throwIfError(error);
}

export async function deleteProjectById(
  projectId: string
): Promise<void> {
  // Delete gallery rows first so this does not depend on FK cascade.
  const { error: galleryError } = await supabase
    .from('project_images')
    .delete()
    .eq('project_id', projectId);

  throwIfError(galleryError);

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  throwIfError(error);

  await logActivity(
    'delete',
    'project',
    `Deleted project ${projectId}`
  );
}
// ==========================================
// PART 2B — CATEGORIES, PHILOSOPHY,
// SERVICES, STATS & TESTIMONIALS
// ==========================================

// ------------------------------------------
// CATEGORIES
// ------------------------------------------

export async function saveCategory(
  category: Category
): Promise<void> {
  const payload: Category = {
    ...category,
    slug: category.slug || slugify(category.name),
    updatedAt: new Date().toISOString(),
  };

  await updateSiteContentItem('categories', payload);

  await logActivity(
    category.id ? 'update' : 'create',
    'category',
    `${category.id ? 'Updated' : 'Created'} category: ${category.name}`
  );
}

export async function deleteCategoryById(
  categoryId: string
): Promise<void> {
  await removeSiteContentItem('categories', categoryId);

  await logActivity(
    'delete',
    'category',
    `Deleted category ${categoryId}`
  );
}

// ------------------------------------------
// PHILOSOPHY ITEMS
// ------------------------------------------

export async function savePhilosophyItem(
  item: PhilosophyItem
): Promise<void> {
  const payload: PhilosophyItem = {
    ...item,
    updatedAt: new Date().toISOString(),
  };

  await updateSiteContentItem('philosophy', payload);

  await logActivity(
    item.id ? 'update' : 'create',
    'philosophy',
    `${item.id ? 'Updated' : 'Created'} philosophy item: ${item.title}`
  );
}

export async function deletePhilosophyById(
  itemId: string
): Promise<void> {
  await removeSiteContentItem('philosophy', itemId);

  await logActivity(
    'delete',
    'philosophy',
    `Deleted philosophy item ${itemId}`
  );
}

// ------------------------------------------
// SERVICES
// ------------------------------------------

export async function saveServiceItem(
  service: ServiceItem
): Promise<void> {
  const payload = {
    title: service.title,
    description: service.description,
    deliverables: service.deliverables ?? [],
    sort_order: service.displayOrder,
    updated_at: new Date().toISOString(),
  };

  if (service.id) {
    const { error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', service.id);

    throwIfError(error);
  } else {
    const { error } = await supabase
      .from('services')
      .insert({
        ...payload,
        published: true,
        created_at: new Date().toISOString(),
      });

    throwIfError(error);
  }

  await logActivity(
    service.id ? 'update' : 'create',
    'service',
    `${service.id ? 'Updated' : 'Created'} service: ${service.title}`
  );
}

export async function deleteServiceById(
  serviceId: string
): Promise<void> {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);

  throwIfError(error);

  await logActivity(
    'delete',
    'service',
    `Deleted service ${serviceId}`
  );
}

// ------------------------------------------
// STATS
// ------------------------------------------

export async function saveStatItem(
  stat: StatItem
): Promise<void> {
  const payload: StatItem = {
    ...stat,
    updatedAt: new Date().toISOString(),
  };

  await updateSiteContentItem('stats', payload);

  await logActivity(
    stat.id ? 'update' : 'create',
    'stat',
    `${stat.id ? 'Updated' : 'Created'} statistic: ${stat.label}`
  );
}

export async function deleteStatById(
  statId: string
): Promise<void> {
  await removeSiteContentItem('stats', statId);

  await logActivity(
    'delete',
    'stat',
    `Deleted statistic ${statId}`
  );
}

// ------------------------------------------
// TESTIMONIALS
// ------------------------------------------

export async function saveTestimonialItem(
  testimonial: Testimonial
): Promise<void> {
  const payload = {
    client_name: testimonial.clientName,
    client_role: testimonial.designation,
    content: testimonial.quote,
    image_url: testimonial.avatarUrl,
    project_ref: testimonial.projectRef,
    sort_order: testimonial.displayOrder,
    updated_at: new Date().toISOString(),
  };

  if (testimonial.id) {
    const { error } = await supabase
      .from('testimonials')
      .update(payload)
      .eq('id', testimonial.id);

    throwIfError(error);
  } else {
    const { error } = await supabase
      .from('testimonials')
      .insert({
        ...payload,
        published: true,
        created_at: new Date().toISOString(),
      });

    throwIfError(error);
  }

  await logActivity(
    testimonial.id ? 'update' : 'create',
    'testimonial',
    `${testimonial.id ? 'Updated' : 'Created'} testimonial from ${testimonial.clientName}`
  );
}

export async function deleteTestimonialById(
  testimonialId: string
): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', testimonialId);

  throwIfError(error);

  await logActivity(
    'delete',
    'testimonial',
    `Deleted testimonial ${testimonialId}`
  );
}

// ==========================================
// PART 2C — MEDIA, INQUIRIES, ADMIN CHECK
// & SUPABASE VERIFICATION
// ==========================================

// ------------------------------------------
// MEDIA ASSETS
// ------------------------------------------

export async function createOrReplaceMediaAsset(
  asset: MediaAsset
): Promise<void> {
  const payload = {
    name: asset.name,
    url: asset.url,
    alt: asset.alt,
    width: asset.width,
    height: asset.height,
    size_kb: asset.sizeKb,
    original_size_kb: asset.originalSizeKb,
    mime_type: asset.mimeType,
    updated_at: new Date().toISOString(),
  };

  if (asset.id) {
    const { error } = await supabase
      .from('media_assets')
      .update(payload)
      .eq('id', asset.id);

    throwIfError(error);
  } else {
    const { error } = await supabase
      .from('media_assets')
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      });

    throwIfError(error);
  }

  await logActivity(
    asset.id ? 'update' : 'create',
    'media',
    `${asset.id ? 'Updated' : 'Added'} media asset: ${asset.name}`
  );
}

export async function deleteMediaAssetById(
  assetId: string
): Promise<void> {
  const { error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', assetId);

  throwIfError(error);

  await logActivity(
    'delete',
    'media',
    `Deleted media asset ${assetId}`
  );
}

// ------------------------------------------
// INQUIRIES
// ------------------------------------------

export async function toggleInquiryReadStatus(
  inquiryId: string,
  read: boolean
): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .update({
      status: read ? 'read' : 'new',
    })
    .eq('id', inquiryId);

  throwIfError(error);

  await logActivity(
    'update',
    'inquiry',
    `${read ? 'Marked as read' : 'Marked as unread'} inquiry ${inquiryId}`
  );
}

export async function deleteInquiryById(
  inquiryId: string
): Promise<void> {
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', inquiryId);

  throwIfError(error);

  await logActivity(
    'delete',
    'inquiry',
    `Deleted inquiry ${inquiryId}`
  );
}

// ------------------------------------------
// ADMIN VERIFICATION
// ------------------------------------------

export async function checkIsAdminUser(
  uid: string,
  _email?: string | null
): Promise<boolean> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || user.id !== uid) {
    return false;
  }

  const { data, error } = await supabase.rpc('is_admin');

  if (error) {
    console.error('Admin verification failed:', error);
    return false;
  }

  return data === true;
}

// ------------------------------------------
// SUPABASE CONNECTION VERIFICATION
// ------------------------------------------

export async function verifySupabaseLoaded(): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }

  return true;
}

// Legacy alias: existing components may still call this name.
export async function verifyFirestoreLoaded(): Promise<boolean> {
  return verifySupabaseLoaded();
}
