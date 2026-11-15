export interface SocialLinks {
  instagram: string;
  linkedin: string;
  archdaily: string;
  behance: string;
}

export interface NavLabels {
  home: string;
  about: string;
  projects: string;
  services: string;
  contact: string;
  cta: string;
}

export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  projects: boolean;
  philosophy: boolean;
  services: boolean;
  stats: boolean;
  testimonials: boolean;
  contact: boolean;
}

export interface SiteSettings {
  id: string;
  studioName: string;
  logoMark: string;
  logoImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutBio: string;
  aboutPhilosophy: string;
  aboutApproach: string;
  aboutExperienceYears: number;
  aboutCredentials: string[];
  aboutPortraitUrl: string;
  aboutPortraitAlt: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  socialLinks: SocialLinks;
  footerDescription: string;
  copyrightText: string;
  seoTitle: string;
  seoDescription: string;
  faviconUrl: string;
  navLabels: NavLabels;
  sectionVisibility: SectionVisibility;
  updatedAt?: string;
}

export interface ProjectGalleryItem {
  url: string;
  alt: string;
  caption: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  year: string;
  summary: string;
  description: string;
  area: string;
  client: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  gallery: ProjectGalleryItem[];
  published: boolean;
  featured: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  updatedAt?: string;
}

export interface PhilosophyItem {
  id: string;
  number: string;
  title: string;
  description: string;
  displayOrder: number;
  updatedAt?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  displayOrder: number;
  updatedAt?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  context: string;
  displayOrder: number;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  designation: string;
  quote: string;
  avatarUrl: string;
  projectRef: string;
  displayOrder: number;
  updatedAt?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  sizeKb: number;
  originalSizeKb: number;
  mimeType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budgetRange: string;
  message: string;
  status: 'unread' | 'read';
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  summary: string;
  actorEmail: string;
  createdAt?: string;
}

export interface ContactFormInput {
  name: string;
  email: string;
  projectType: string;
  budgetRange: string;
  message: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalTestimonials: number;
  totalInquiries: number;
  unreadInquiries: number;
}
