import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MEDIA,
  DEFAULT_PHILOSOPHY,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_TESTIMONIALS,
} from '../data/seedPortfolio';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  isValidDocumentId,
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

function formatTimestamp(ts: unknown): string | undefined {
  if (!ts) return undefined;
  if (typeof ts === 'string') return ts;
  if (typeof (ts as Timestamp).toDate === 'function') {
    return (ts as Timestamp).toDate().toISOString();
  }
  return undefined;
}

function makeDocId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  const id = `${prefix}-${Date.now()}-${random}`;
  return isValidDocumentId(id) ? id : `${prefix}-${Date.now()}`;
}

export function subscribePublicPortfolio(
  onUpdate: (state: PublicPortfolioState) => void,
  onError?: (err: Error) => void
): () => void {
  const current: PublicPortfolioState = {
    settings: DEFAULT_SITE_SETTINGS,
    projects: DEFAULT_PROJECTS.filter((p) => p.published),
    categories: DEFAULT_CATEGORIES,
    philosophy: DEFAULT_PHILOSOPHY,
    services: DEFAULT_SERVICES,
    stats: DEFAULT_STATS,
    testimonials: DEFAULT_TESTIMONIALS,
    loadedFromFirestore: false,
  };

  const emit = () => onUpdate({ ...current });

  const unsubs: Array<() => void> = [];

  unsubs.push(
    onSnapshot(
      doc(db, 'siteSettings', 'studio'),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          current.settings = {
            ...DEFAULT_SITE_SETTINGS,
            ...d,
            id: snap.id,
            updatedAt: formatTimestamp(d.updatedAt),
          } as SiteSettings;
          current.loadedFromFirestore = true;
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'projects'), where('published', '==', true)),
      (snap) => {
        if (!snap.empty || current.loadedFromFirestore) {
          current.projects = snap.docs
            .map((d) => ({
              ...(d.data() as Omit<Project, 'id'>),
              id: d.id,
              createdAt: formatTimestamp(d.data().createdAt),
              updatedAt: formatTimestamp(d.data().updatedAt),
            }))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        if (!snap.empty || current.loadedFromFirestore) {
          current.categories = snap.docs
            .map((d) => ({
              ...(d.data() as Omit<Category, 'id'>),
              id: d.id,
              updatedAt: formatTimestamp(d.data().updatedAt),
            }))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'philosophy'),
      (snap) => {
        if (!snap.empty || current.loadedFromFirestore) {
          current.philosophy = snap.docs
            .map((d) => ({
              ...(d.data() as Omit<PhilosophyItem, 'id'>),
              id: d.id,
              updatedAt: formatTimestamp(d.data().updatedAt),
            }))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'services'),
      (snap) => {
        if (!snap.empty || current.loadedFromFirestore) {
          current.services = snap.docs
            .map((d) => ({
              ...(d.data() as Omit<ServiceItem, 'id'>),
              id: d.id,
              updatedAt: formatTimestamp(d.data().updatedAt),
            }))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'stats'),
      (snap) => {
        if (!snap.empty || current.loadedFromFirestore) {
          current.stats = snap.docs
            .map((d) => ({
              ...(d.data() as Omit<StatItem, 'id'>),
              id: d.id,
              updatedAt: formatTimestamp(d.data().updatedAt),
            }))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'testimonials'),
      (snap) => {
        if (!snap.empty || current.loadedFromFirestore) {
          current.testimonials = snap.docs
            .map((d) => ({
              ...(d.data() as Omit<Testimonial, 'id'>),
              id: d.id,
              updatedAt: formatTimestamp(d.data().updatedAt),
            }))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  return () => {
    for (const unsub of unsubs) unsub();
  };
}

export function subscribeAdminCMS(
  onUpdate: (state: AdminCMSState) => void,
  onError?: (err: Error) => void
): () => void {
  const current: AdminCMSState = {
    settings: DEFAULT_SITE_SETTINGS,
    projects: [],
    categories: [],
    philosophy: [],
    services: [],
    stats: [],
    testimonials: [],
    media: [],
    inquiries: [],
    activities: [],
    loadedFromFirestore: false,
  };

  const emit = () => onUpdate({ ...current });
  const unsubs: Array<() => void> = [];

  unsubs.push(
    onSnapshot(
      doc(db, 'siteSettings', 'studio'),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          current.settings = {
            ...DEFAULT_SITE_SETTINGS,
            ...d,
            id: snap.id,
            updatedAt: formatTimestamp(d.updatedAt),
          } as SiteSettings;
          current.loadedFromFirestore = true;
        }
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'projects'),
      (snap) => {
        current.projects = snap.docs
          .map((d) => ({
            ...(d.data() as Omit<Project, 'id'>),
            id: d.id,
            createdAt: formatTimestamp(d.data().createdAt),
            updatedAt: formatTimestamp(d.data().updatedAt),
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        current.categories = snap.docs
          .map((d) => ({
            ...(d.data() as Omit<Category, 'id'>),
            id: d.id,
            updatedAt: formatTimestamp(d.data().updatedAt),
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'philosophy'),
      (snap) => {
        current.philosophy = snap.docs
          .map((d) => ({
            ...(d.data() as Omit<PhilosophyItem, 'id'>),
            id: d.id,
            updatedAt: formatTimestamp(d.data().updatedAt),
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'services'),
      (snap) => {
        current.services = snap.docs
          .map((d) => ({
            ...(d.data() as Omit<ServiceItem, 'id'>),
            id: d.id,
            updatedAt: formatTimestamp(d.data().updatedAt),
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'stats'),
      (snap) => {
        current.stats = snap.docs
          .map((d) => ({
            ...(d.data() as Omit<StatItem, 'id'>),
            id: d.id,
            updatedAt: formatTimestamp(d.data().updatedAt),
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'testimonials'),
      (snap) => {
        current.testimonials = snap.docs
          .map((d) => ({
            ...(d.data() as Omit<Testimonial, 'id'>),
            id: d.id,
            updatedAt: formatTimestamp(d.data().updatedAt),
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'media'), orderBy('createdAt', 'desc')),
      (snap) => {
        current.media = snap.docs.map((d) => ({
          ...(d.data() as Omit<MediaAsset, 'id'>),
          id: d.id,
          createdAt: formatTimestamp(d.data().createdAt),
          updatedAt: formatTimestamp(d.data().updatedAt),
        }));
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')),
      (snap) => {
        current.inquiries = snap.docs.map((d) => ({
          ...(d.data() as Omit<Inquiry, 'id'>),
          id: d.id,
          createdAt: formatTimestamp(d.data().createdAt),
        }));
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'activities'), orderBy('createdAt', 'desc')),
      (snap) => {
        current.activities = snap.docs.slice(0, 25).map((d) => ({
          ...(d.data() as Omit<ActivityLog, 'id'>),
          id: d.id,
          createdAt: formatTimestamp(d.data().createdAt),
        }));
        emit();
      },
      (err) => {
        if (onError) onError(err);
      }
    )
  );

  return () => {
    for (const unsub of unsubs) unsub();
  };
}

export async function seedFirestoreIfEmpty(actorEmail: string): Promise<boolean> {
  const path = 'siteSettings/studio';
  try {
    const existing = await getDoc(doc(db, 'siteSettings', 'studio'));
    if (existing.exists()) return false;

    const batch = writeBatch(db);
    const { id: _settingId, updatedAt: _u, ...settingData } = DEFAULT_SITE_SETTINGS;
    batch.set(doc(db, 'siteSettings', 'studio'), {
      ...settingData,
      updatedAt: serverTimestamp(),
    });

    for (const cat of DEFAULT_CATEGORIES) {
      const { id, updatedAt: _cu, ...data } = cat;
      batch.set(doc(db, 'categories', id), { ...data, updatedAt: serverTimestamp() });
    }

    for (const proj of DEFAULT_PROJECTS) {
      const { id, createdAt: _ca, updatedAt: _ua, ...data } = proj;
      batch.set(doc(db, 'projects', id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const item of DEFAULT_PHILOSOPHY) {
      const { id, updatedAt: _pu, ...data } = item;
      batch.set(doc(db, 'philosophy', id), { ...data, updatedAt: serverTimestamp() });
    }

    for (const srv of DEFAULT_SERVICES) {
      const { id, updatedAt: _su, ...data } = srv;
      batch.set(doc(db, 'services', id), { ...data, updatedAt: serverTimestamp() });
    }

    for (const st of DEFAULT_STATS) {
      const { id, updatedAt: _stu, ...data } = st;
      batch.set(doc(db, 'stats', id), { ...data, updatedAt: serverTimestamp() });
    }

    for (const testItem of DEFAULT_TESTIMONIALS) {
      const { id, updatedAt: _tu, ...data } = testItem;
      batch.set(doc(db, 'testimonials', id), { ...data, updatedAt: serverTimestamp() });
    }

    for (const media of DEFAULT_MEDIA) {
      const { id, createdAt: _mca, updatedAt: _mua, ...data } = media;
      batch.set(doc(db, 'media', id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    batch.set(doc(db, 'activities', makeDocId('act')), {
      action: 'Initialized Studio CMS',
      entityType: 'system',
      summary: 'Populated initial portfolio projects, services, philosophy, and settings.',
      actorEmail: actorEmail.slice(0, 160),
      createdAt: serverTimestamp(),
    });

    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

async function logActivity(action: string, entityType: string, summary: string) {
  const actorEmail = auth.currentUser?.email || 'studio-admin';
  const id = makeDocId('act');
  try {
    await setDoc(doc(db, 'activities', id), {
      action: action.slice(0, 120),
      entityType: entityType.slice(0, 60),
      summary: summary.slice(0, 240),
      actorEmail: actorEmail.slice(0, 160),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Activity log skipped:', error);
  }
}

export async function submitPublicInquiry(input: ContactFormInput): Promise<void> {
  const clean = sanitizeInquiryInput(input);
  const id = makeDocId('inq');
  const path = `inquiries/${id}`;
  try {
    await setDoc(doc(db, 'inquiries', id), {
      ...clean,
      status: 'unread',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const path = 'siteSettings/studio';
  const payload = sanitizeSiteSettingsInput(settings);
  try {
    await setDoc(doc(db, 'siteSettings', 'studio'), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    await logActivity('Updated Studio Settings', 'siteSettings', `Updated global configuration for ${payload.studioName}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createOrUpdateProject(
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const clean = sanitizeProjectInput(project);
  const id = existingId && isValidDocumentId(existingId) ? existingId : makeDocId('proj');
  const path = `projects/${id}`;
  try {
    if (existingId) {
      await updateDoc(doc(db, 'projects', id), {
        ...clean,
        updatedAt: serverTimestamp(),
      });
      await logActivity('Updated Project', 'project', `Modified "${clean.title}"`);
    } else {
      await setDoc(doc(db, 'projects', id), {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logActivity('Created Project', 'project', `Added "${clean.title}" (${clean.category})`);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function toggleProjectPublished(project: Project): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    await updateDoc(doc(db, 'projects', project.id), {
      published: !project.published,
      updatedAt: serverTimestamp(),
    });
    await logActivity(
      !project.published ? 'Published Project' : 'Unpublished Project',
      'project',
      `${!project.published ? 'Published' : 'Moved to drafts'} "${project.title}"`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateProjectOrder(projectId: string, displayOrder: number): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      displayOrder,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProjectById(project: Project): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    await deleteDoc(doc(db, 'projects', project.id));
    await logActivity('Deleted Project', 'project', `Removed "${project.title}"`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCategory(name: string, displayOrder: number, existingId?: string): Promise<void> {
  const cleanName = name.trim().slice(0, 80);
  const id = existingId && isValidDocumentId(existingId) ? existingId : makeDocId('cat');
  const path = `categories/${id}`;
  try {
    await setDoc(doc(db, 'categories', id), {
      name: cleanName,
      slug: slugify(cleanName, 80),
      displayOrder,
      updatedAt: serverTimestamp(),
    });
    await logActivity(existingId ? 'Updated Category' : 'Created Category', 'category', cleanName);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategoryById(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    await deleteDoc(doc(db, 'categories', category.id));
    await logActivity('Deleted Category', 'category', category.name);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function savePhilosophyItem(
  item: Omit<PhilosophyItem, 'id' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId && isValidDocumentId(existingId) ? existingId : makeDocId('phil');
  const path = `philosophy/${id}`;
  try {
    await setDoc(doc(db, 'philosophy', id), {
      number: item.number.trim().slice(0, 8),
      title: item.title.trim().slice(0, 120),
      description: item.description.trim().slice(0, 1000),
      displayOrder: item.displayOrder,
      updatedAt: serverTimestamp(),
    });
    await logActivity(existingId ? 'Updated Philosophy' : 'Created Philosophy', 'philosophy', `${item.number} — ${item.title}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePhilosophyById(item: PhilosophyItem): Promise<void> {
  const path = `philosophy/${item.id}`;
  try {
    await deleteDoc(doc(db, 'philosophy', item.id));
    await logActivity('Deleted Philosophy', 'philosophy', item.title);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveServiceItem(
  item: Omit<ServiceItem, 'id' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId && isValidDocumentId(existingId) ? existingId : makeDocId('srv');
  const path = `services/${id}`;
  try {
    await setDoc(doc(db, 'services', id), {
      title: item.title.trim().slice(0, 120),
      description: item.description.trim().slice(0, 800),
      deliverables: (item.deliverables || []).map((d) => d.trim().slice(0, 120)).filter(Boolean).slice(0, 8),
      displayOrder: item.displayOrder,
      updatedAt: serverTimestamp(),
    });
    await logActivity(existingId ? 'Updated Service' : 'Created Service', 'service', item.title);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteServiceById(item: ServiceItem): Promise<void> {
  const path = `services/${item.id}`;
  try {
    await deleteDoc(doc(db, 'services', item.id));
    await logActivity('Deleted Service', 'service', item.title);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveStatItem(
  item: Omit<StatItem, 'id' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId && isValidDocumentId(existingId) ? existingId : makeDocId('stat');
  const path = `stats/${id}`;
  try {
    await setDoc(doc(db, 'stats', id), {
      label: item.label.trim().slice(0, 80),
      value: Number(item.value) || 0,
      suffix: (item.suffix || '').trim().slice(0, 16),
      context: (item.context || '').trim().slice(0, 120),
      displayOrder: item.displayOrder,
      updatedAt: serverTimestamp(),
    });
    await logActivity(existingId ? 'Updated Statistic' : 'Created Statistic', 'stat', `${item.label}: ${item.value}${item.suffix}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStatById(item: StatItem): Promise<void> {
  const path = `stats/${item.id}`;
  try {
    await deleteDoc(doc(db, 'stats', item.id));
    await logActivity('Deleted Statistic', 'stat', item.label);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveTestimonialItem(
  item: Omit<Testimonial, 'id' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId && isValidDocumentId(existingId) ? existingId : makeDocId('test');
  const path = `testimonials/${id}`;
  try {
    await setDoc(doc(db, 'testimonials', id), {
      clientName: item.clientName.trim().slice(0, 100),
      designation: item.designation.trim().slice(0, 140),
      quote: item.quote.trim().slice(0, 1200),
      avatarUrl: (item.avatarUrl || '').trim().slice(0, 800000),
      projectRef: (item.projectRef || '').trim().slice(0, 120),
      displayOrder: item.displayOrder,
      updatedAt: serverTimestamp(),
    });
    await logActivity(existingId ? 'Updated Testimonial' : 'Created Testimonial', 'testimonial', item.clientName);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTestimonialById(item: Testimonial): Promise<void> {
  const path = `testimonials/${item.id}`;
  try {
    await deleteDoc(doc(db, 'testimonials', item.id));
    await logActivity('Deleted Testimonial', 'testimonial', item.clientName);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createOrReplaceMediaAsset(
  asset: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId && isValidDocumentId(existingId) ? existingId : makeDocId('media');
  const path = `media/${id}`;
  try {
    const cleanPayload = {
      name: asset.name.trim().slice(0, 140),
      url: asset.url.trim().slice(0, 800000),
      alt: asset.alt.trim().slice(0, 240),
      width: asset.width,
      height: asset.height,
      sizeKb: asset.sizeKb,
      originalSizeKb: asset.originalSizeKb,
      mimeType: asset.mimeType.slice(0, 60),
    };

    if (existingId) {
      await updateDoc(doc(db, 'media', id), {
        ...cleanPayload,
        updatedAt: serverTimestamp(),
      });
      await logActivity('Updated Media Asset', 'media', cleanPayload.name);
    } else {
      await setDoc(doc(db, 'media', id), {
        ...cleanPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logActivity('Uploaded Media Asset', 'media', `${cleanPayload.name} (${cleanPayload.sizeKb} KB)`);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteMediaAssetById(asset: MediaAsset): Promise<void> {
  const path = `media/${asset.id}`;
  try {
    await deleteDoc(doc(db, 'media', asset.id));
    await logActivity('Deleted Media Asset', 'media', asset.name);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function toggleInquiryReadStatus(inquiry: Inquiry): Promise<void> {
  const path = `inquiries/${inquiry.id}`;
  const nextStatus = inquiry.status === 'unread' ? 'read' : 'unread';
  try {
    await updateDoc(doc(db, 'inquiries', inquiry.id), {
      status: nextStatus,
    });
    await logActivity('Updated Inquiry Status', 'inquiry', `Marked ${inquiry.name} as ${nextStatus}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInquiryById(inquiry: Inquiry): Promise<void> {
  const path = `inquiries/${inquiry.id}`;
  try {
    await deleteDoc(doc(db, 'inquiries', inquiry.id));
    await logActivity('Deleted Inquiry', 'inquiry', `Removed inquiry from ${inquiry.name}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function checkIsAdminUser(uid: string, email: string | null): Promise<boolean> {
  if (email === 'ag.developer.co@gmail.com') return true;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function verifyFirestoreLoaded(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'projects'));
    return !snap.empty;
  } catch {
    return false;
  }
}
