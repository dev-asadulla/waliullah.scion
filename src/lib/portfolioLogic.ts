import type {
  ContactFormInput,
  DashboardMetrics,
  Inquiry,
  Project,
  SiteSettings,
  Testimonial,
} from '../types/portfolio';

export const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const SLUG_PATTERN = /^[a-z0-9-]+$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidDocumentId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && ID_PATTERN.test(id);
}

export function slugify(value: string, maxLength = 80): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const sliced = normalized.slice(0, maxLength).replace(/-+$/g, '');
  return sliced || 'item';
}

export function filterAndSortProjects(
  projects: Project[],
  selectedCategory: string,
  includeUnpublished = false
): Project[] {
  return projects
    .filter((project) => (includeUnpublished ? true : project.published))
    .filter((project) =>
      selectedCategory === 'All' || !selectedCategory
        ? true
        : project.category === selectedCategory
    )
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function computeDashboardMetrics(
  projects: Project[],
  testimonials: Testimonial[],
  inquiries: Inquiry[]
): DashboardMetrics {
  const publishedProjects = projects.filter((p) => p.published).length;
  const draftProjects = projects.length - publishedProjects;
  const unreadInquiries = inquiries.filter((inq) => inq.status === 'unread').length;

  return {
    totalProjects: projects.length,
    publishedProjects,
    draftProjects,
    totalTestimonials: testimonials.length,
    totalInquiries: inquiries.length,
    unreadInquiries,
  };
}

export function validateContactForm(input: ContactFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const projectType = input.projectType.trim();
  const budgetRange = input.budgetRange.trim();
  const message = input.message.trim();

  if (name.length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  } else if (name.length > 120) {
    errors.name = 'Name must be 120 characters or fewer.';
  }

  if (!email) {
    errors.email = 'Please enter an email address.';
  } else if (email.length > 160 || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!projectType || projectType.length > 80) {
    errors.projectType = 'Please select a valid project type.';
  }

  if (budgetRange.length > 80) {
    errors.budgetRange = 'Budget range must be 80 characters or fewer.';
  }

  if (message.length < 10) {
    errors.message = 'Please share a brief project overview (at least 10 characters).';
  } else if (message.length > 3000) {
    errors.message = 'Message must be 3,000 characters or fewer.';
  }

  return errors;
}

export function sanitizeInquiryInput(input: ContactFormInput): ContactFormInput {
  return {
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().slice(0, 160),
    projectType: input.projectType.trim().slice(0, 80),
    budgetRange: input.budgetRange.trim().slice(0, 80),
    message: input.message.trim().slice(0, 3000),
  };
}

export function sanitizeProjectInput(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  const cleanTitle = input.title.trim().slice(0, 140);
  const cleanSlug = slugify(input.slug || cleanTitle, 140);
  return {
    title: cleanTitle,
    slug: cleanSlug,
    category: input.category.trim().slice(0, 80),
    location: input.location.trim().slice(0, 120),
    year: input.year.trim().slice(0, 16),
    summary: input.summary.trim().slice(0, 500),
    description: input.description.trim().slice(0, 4000),
    area: (input.area || '').trim().slice(0, 60),
    client: (input.client || '').trim().slice(0, 120),
    thumbnailUrl: input.thumbnailUrl.trim().slice(0, 800000),
    thumbnailAlt: (input.thumbnailAlt || cleanTitle).trim().slice(0, 240),
    gallery: (input.gallery || []).slice(0, 12).map((item) => ({
      url: item.url.trim().slice(0, 800000),
      alt: (item.alt || cleanTitle).trim().slice(0, 240),
      caption: (item.caption || '').trim().slice(0, 240),
    })),
    published: Boolean(input.published),
    featured: Boolean(input.featured),
    displayOrder: Number.isFinite(input.displayOrder) ? Math.max(0, Math.round(input.displayOrder)) : 0,
  };
}

export function calculateCompressionMetrics(originalBytes: number, optimizedBytes: number) {
  const originalKb = Math.max(1, Math.round(originalBytes / 1024));
  const sizeKb = Math.max(1, Math.round(optimizedBytes / 1024));
  const savedPercent =
    originalBytes > 0 ? Math.max(0, Math.round(((originalBytes - optimizedBytes) / originalBytes) * 100)) : 0;
  return { originalKb, sizeKb, savedPercent };
}

export function distributeMasonryColumns<T>(items: T[], columnCount: number): T[][] {
  if (items.length === 0) return [];
  const safeCount = Math.max(1, Math.min(Math.floor(columnCount), items.length));
  const columns: T[][] = Array.from({ length: safeCount }, () => []);
  items.forEach((item, index) => {
    columns[index % safeCount].push(item);
  });
  return columns;
}

export function sanitizeSiteSettingsInput(settings: SiteSettings): Omit<SiteSettings, 'id' | 'updatedAt'> {
  const cleanStudio = settings.studioName.trim().slice(0, 100) || 'Studio';
  const cleanLogoMark = settings.logoMark.trim().slice(0, 24) || cleanStudio.slice(0, 2).toUpperCase();
  return {
    studioName: cleanStudio,
    logoMark: cleanLogoMark,
    logoImageUrl: (settings.logoImageUrl || '').trim().slice(0, 400000),
    heroTitle: settings.heroTitle.trim().slice(0, 180),
    heroSubtitle: settings.heroSubtitle.trim().slice(0, 500),
    heroImageUrl: settings.heroImageUrl.trim().slice(0, 800000),
    heroImageAlt: (settings.heroImageAlt || '').trim().slice(0, 240),
    aboutEyebrow: (settings.aboutEyebrow || '').trim().slice(0, 80),
    aboutTitle: settings.aboutTitle.trim().slice(0, 180),
    aboutBio: settings.aboutBio.trim().slice(0, 2000),
    aboutPhilosophy: (settings.aboutPhilosophy || '').trim().slice(0, 2000),
    aboutApproach: (settings.aboutApproach || '').trim().slice(0, 2000),
    aboutExperienceYears: Number.isFinite(settings.aboutExperienceYears)
      ? Math.max(0, Math.min(200, Math.round(settings.aboutExperienceYears)))
      : 0,
    aboutCredentials: (settings.aboutCredentials || [])
      .map((c) => c.trim().slice(0, 200))
      .filter(Boolean)
      .slice(0, 10),
    aboutPortraitUrl: (settings.aboutPortraitUrl || '').trim().slice(0, 800000),
    aboutPortraitAlt: (settings.aboutPortraitAlt || '').trim().slice(0, 240),
    contactEmail: settings.contactEmail.trim().slice(0, 160),
    contactPhone: settings.contactPhone.trim().slice(0, 60),
    contactLocation: settings.contactLocation.trim().slice(0, 160),
    socialLinks: settings.socialLinks,
    footerDescription: (settings.footerDescription || '').trim().slice(0, 500),
    copyrightText: (settings.copyrightText || '').trim().slice(0, 200),
    seoTitle: (settings.seoTitle || '').trim().slice(0, 140),
    seoDescription: (settings.seoDescription || '').trim().slice(0, 320),
    faviconUrl: (settings.faviconUrl || '').trim().slice(0, 100000),
    navLabels: settings.navLabels,
    sectionVisibility: settings.sectionVisibility,
  };
}

