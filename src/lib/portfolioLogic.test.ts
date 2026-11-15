import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCompressionMetrics,
  computeDashboardMetrics,
  distributeMasonryColumns,
  filterAndSortProjects,
  isValidDocumentId,
  sanitizeInquiryInput,
  sanitizeProjectInput,
  sanitizeSiteSettingsInput,
  slugify,
  validateContactForm,
} from './portfolioLogic';
import type { Inquiry, Project, SiteSettings, Testimonial } from '../types/portfolio';

const sampleProjects: Project[] = [
  {
    id: 'p1',
    title: 'Haus am Berg',
    slug: 'haus-am-berg',
    category: 'Residential Architecture',
    location: 'Zurich, Switzerland',
    year: '2025',
    summary: 'Cantilevered concrete home.',
    description: 'Detailed architectural narrative.',
    area: '540 sqm',
    client: 'Private',
    thumbnailUrl: '/img/1.jpg',
    thumbnailAlt: 'Haus am Berg exterior',
    gallery: [],
    published: true,
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'p2',
    title: 'Kunsthalle Atrium',
    slug: 'kunsthalle-atrium',
    category: 'Commercial Architecture',
    location: 'Basel, Switzerland',
    year: '2024',
    summary: 'Museum atrium and stair.',
    description: 'Museum spatial narrative.',
    area: '4200 sqm',
    client: 'Foundation',
    thumbnailUrl: '/img/2.jpg',
    thumbnailAlt: 'Atrium',
    gallery: [],
    published: true,
    featured: false,
    displayOrder: 1,
  },
  {
    id: 'p3',
    title: 'Unbuilt Cliff Tower',
    slug: 'unbuilt-cliff-tower',
    category: 'Conceptual Projects',
    location: 'Reykjavik, Iceland',
    year: '2026',
    summary: 'Concept study.',
    description: 'Conceptual monolith.',
    area: '1800 sqm',
    client: 'Research',
    thumbnailUrl: '/img/3.jpg',
    thumbnailAlt: 'Cliff Tower',
    gallery: [],
    published: false,
    featured: false,
    displayOrder: 0,
  },
];

test('slugify produces URL-safe lowercase slugs matching blueprint pattern', () => {
  assert.equal(slugify('Haus am Berg — Zurich 2025!'), 'haus-am-berg-zurich-2025');
  assert.equal(slugify('   '), 'item');
});

test('isValidDocumentId enforces safe Firestore ID format and bounds', () => {
  assert.equal(isValidDocumentId('project-01_a'), true);
  assert.equal(isValidDocumentId('bad/id'), false);
  assert.equal(isValidDocumentId('bad$id'), false);
  assert.equal(isValidDocumentId('a'.repeat(129)), false);
});

test('filterAndSortProjects excludes drafts publicly and sorts by displayOrder', () => {
  const publicAll = filterAndSortProjects(sampleProjects, 'All', false);
  assert.deepEqual(
    publicAll.map((p) => p.id),
    ['p2', 'p1']
  );

  const publicRes = filterAndSortProjects(sampleProjects, 'Residential Architecture', false);
  assert.deepEqual(
    publicRes.map((p) => p.id),
    ['p1']
  );

  const adminAll = filterAndSortProjects(sampleProjects, 'All', true);
  assert.deepEqual(
    adminAll.map((p) => p.id),
    ['p3', 'p2', 'p1']
  );
});

test('computeDashboardMetrics accurately tallies published, drafts, testimonials, and unread inquiries', () => {
  const testimonials: Testimonial[] = [
    {
      id: 't1',
      clientName: 'A. Meyer',
      designation: 'Director',
      quote: 'Remarkable spatial clarity.',
      avatarUrl: '',
      projectRef: 'Kunsthalle Atrium',
      displayOrder: 1,
    },
  ];
  const inquiries: Inquiry[] = [
    {
      id: 'i1',
      name: 'Elena',
      email: 'elena@example.com',
      projectType: 'Residential Architecture',
      budgetRange: '$1M - $3M',
      message: 'We would like to discuss a hillside residence.',
      status: 'unread',
    },
    {
      id: 'i2',
      name: 'Marcus',
      email: 'marcus@example.com',
      projectType: 'Interior Design',
      budgetRange: '$250k - $500k',
      message: 'Looking for interior architecture services.',
      status: 'read',
    },
  ];

  const metrics = computeDashboardMetrics(sampleProjects, testimonials, inquiries);
  assert.deepEqual(metrics, {
    totalProjects: 3,
    publishedProjects: 2,
    draftProjects: 1,
    totalTestimonials: 1,
    totalInquiries: 2,
    unreadInquiries: 1,
  });
});

test('validateContactForm rejects empty or invalid inputs and accepts valid submissions', () => {
  const invalid = validateContactForm({
    name: 'A',
    email: 'invalid-email',
    projectType: '',
    budgetRange: '',
    message: 'Too short',
  });
  assert.ok(invalid.name);
  assert.ok(invalid.email);
  assert.ok(invalid.projectType);
  assert.ok(invalid.message);

  const valid = validateContactForm({
    name: 'Clara Lindqvist',
    email: 'clara@studio.ch',
    projectType: 'Residential Architecture',
    budgetRange: '$2M - $5M',
    message: 'Commissioning a lakeside minimalist concrete residence near Zug.',
  });
  assert.deepEqual(valid, {});
});

test('sanitizeInquiryInput and sanitizeProjectInput enforce blueprint length caps', () => {
  const inquiry = sanitizeInquiryInput({
    name: '  Clara  ',
    email: ' clara@studio.ch ',
    projectType: 'Residential Architecture',
    budgetRange: ' $2M ',
    message: '  ' + 'x'.repeat(3500),
  });
  assert.equal(inquiry.name, 'Clara');
  assert.equal(inquiry.message.length, 3000);

  const project = sanitizeProjectInput({
    title: 'A'.repeat(200),
    slug: 'Invalid Slug!!',
    category: 'Residential Architecture',
    location: 'Zurich',
    year: '2026',
    summary: 'Summary',
    description: 'Description',
    area: '400 sqm',
    client: 'Private',
    thumbnailUrl: 'https://example.com/a.jpg',
    thumbnailAlt: '',
    gallery: new Array(15).fill({ url: 'u', alt: 'a', caption: 'c' }),
    published: true,
    featured: false,
    displayOrder: -5,
  });
  assert.equal(project.title.length, 140);
  assert.equal(project.slug, 'invalid-slug');
  assert.equal(project.gallery.length, 12);
  assert.equal(project.displayOrder, 0);
});

test('calculateCompressionMetrics calculates savings accurately', () => {
  const result = calculateCompressionMetrics(2048 * 1024, 256 * 1024);
  assert.deepEqual(result, { originalKb: 2048, sizeKb: 256, savedPercent: 88 });
});

test('distributeMasonryColumns distributes items across columns and caps to item count', () => {
  assert.deepEqual(distributeMasonryColumns([], 3), []);

  const five = ['p1', 'p2', 'p3', 'p4', 'p5'];
  assert.deepEqual(distributeMasonryColumns(five, 3), [
    ['p1', 'p4'],
    ['p2', 'p5'],
    ['p3'],
  ]);
  assert.deepEqual(distributeMasonryColumns(five, 2), [
    ['p1', 'p3', 'p5'],
    ['p2', 'p4'],
  ]);
  assert.deepEqual(distributeMasonryColumns(five, 1), [five]);
  assert.deepEqual(distributeMasonryColumns(['only'], 3), [['only']]);
});

test('sanitizeSiteSettingsInput preserves logoImageUrl and enforces field bounds', () => {
  const fixture: SiteSettings = {
    id: 'studio',
    studioName: '  Studio Nord  ',
    logoMark: '   ',
    logoImageUrl: '  data:image/png;base64,abc123  ',
    heroTitle: 'Architecture Beyond Boundaries.',
    heroSubtitle: 'Monolithic practice.',
    heroImageUrl: '/hero.jpg',
    heroImageAlt: 'Hero',
    aboutEyebrow: 'Practice',
    aboutTitle: 'About',
    aboutBio: 'Bio text.',
    aboutPhilosophy: 'Philosophy.',
    aboutApproach: 'Approach.',
    aboutExperienceYears: 18,
    aboutCredentials: ['RIBA'],
    aboutPortraitUrl: '/portrait.jpg',
    aboutPortraitAlt: 'Portrait',
    contactEmail: 'studio@nord.arch',
    contactPhone: '+41 44 000 0000',
    contactLocation: 'Zurich',
    socialLinks: { instagram: '', linkedin: '', archdaily: '', behance: '' },
    footerDescription: 'Footer',
    copyrightText: '© 2026',
    seoTitle: 'Title',
    seoDescription: 'Desc',
    faviconUrl: '',
    navLabels: { home: 'Home', about: 'About', projects: 'Projects', services: 'Services', contact: 'Contact', cta: "Let's Talk" },
    sectionVisibility: { hero: true, about: true, projects: true, philosophy: true, services: true, stats: true, testimonials: true, contact: true },
  };
  const sanitized = sanitizeSiteSettingsInput(fixture);
  assert.equal(sanitized.studioName, 'Studio Nord');
  assert.equal(sanitized.logoMark, 'ST');
  assert.equal(sanitized.logoImageUrl, 'data:image/png;base64,abc123');
});

