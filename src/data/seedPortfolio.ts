import heroCantileverImg from '../assets/images/hero_cantilever_pavilion_1794761594933.jpg';
import architectPortraitImg from '../assets/images/architect_studio_portrait_1794761595935.jpg';
import projectMonolithImg from '../assets/images/project_monolith_residence_1794761596964.jpg';
import projectAtriumImg from '../assets/images/project_gallery_atrium_1794761596111.jpg';
import projectInteriorImg from '../assets/images/project_minimal_interior_1794761597260.jpg';
import projectVerticalInteriorImg from '../assets/images/project_vertical_interior_1794762851756.jpg';
import projectCourtyardImg from '../assets/images/project_basalt_courtyard_1794761597945.jpg';
import projectConceptualImg from '../assets/images/project_conceptual_tower_1794761597996.jpg';
import projectVerticalTowerImg from '../assets/images/project_vertical_tower_1794762851581.jpg';

import type {
  Category,
  MediaAsset,
  PhilosophyItem,
  Project,
  ServiceItem,
  SiteSettings,
  StatItem,
  Testimonial,
} from '../types/portfolio';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'studio',
  studioName: 'Voss & Kerr',
  logoMark: 'VK',
  logoImageUrl: '',
  heroTitle: 'Architecture Beyond Boundaries.',
  heroSubtitle:
    'A Zurich and New York architectural practice shaping monolithic residences, civic sanctuaries, and quiet material permanence.',
  heroImageUrl: heroCantileverImg,
  heroImageAlt:
    'Cantilevered board-formed concrete and glass pavilion overlooking misty water at dusk',
  aboutEyebrow: 'The Practice',
  aboutTitle: 'Precision in Shadow, Permanence in Stone.',
  aboutBio:
    'Founded by principal architect Clara Voss and partner Julian Kerr, our practice operates at the intersection of structural restraint and site-specific poetry. Every commission begins with topography, solar geometry, and an uncompromising discipline of raw material.',
  aboutPhilosophy:
    'We reject ornamental excess in favor of enduring proportions. Light is treated as our primary structural medium—carving volume out of board-formed concrete, blackened steel, and honed basalt.',
  aboutApproach:
    'From initial feasibility studies to bespoke millwork detailing, our studio directs every phase in close dialogue with master artisans, structural engineers, and environmental consultants.',
  aboutExperienceYears: 18,
  aboutCredentials: [
    'RIBA International Excellence Award Laureate',
    'Swiss Society of Engineers & Architects (SIA)',
    'AIA Honor Award for Residential Architecture',
    'Venice Architecture Biennale Exhibitor',
  ],
  aboutPortraitUrl: architectPortraitImg,
  aboutPortraitAlt:
    'Principal architect Clara Voss beside architectural scale models in the concrete studio',
  contactEmail: 'studio@vosskerr.arch',
  contactPhone: '+41 44 580 24 90',
  contactLocation: 'Talstrasse 82, 8001 Zurich · 48 Mercer St, New York',
  socialLinks: {
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    archdaily: 'https://archdaily.com',
    behance: 'https://behance.net',
  },
  footerDescription:
    'International architecture and interior studio dedicated to monolithic minimalism, spatial clarity, and climate-responsive construction.',
  copyrightText: '© 2026 Voss & Kerr Architects. All rights reserved.',
  seoTitle: 'Voss & Kerr — Architecture Beyond Boundaries',
  seoDescription:
    'Minimalist architectural studio crafting monolithic residences, cultural landmarks, and enduring spatial environments.',
  faviconUrl: '',
  navLabels: {
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    services: 'Services',
    contact: 'Contact',
    cta: "Let's Talk",
  },
  sectionVisibility: {
    hero: true,
    about: true,
    projects: true,
    philosophy: true,
    services: true,
    stats: true,
    testimonials: true,
    contact: true,
  },
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-residential', name: 'Residential Architecture', slug: 'residential-architecture', displayOrder: 1 },
  { id: 'cat-commercial', name: 'Commercial Architecture', slug: 'commercial-architecture', displayOrder: 2 },
  { id: 'cat-interior', name: 'Interior Design', slug: 'interior-design', displayOrder: 3 },
  { id: 'cat-landscape', name: 'Landscape Architecture', slug: 'landscape-architecture', displayOrder: 4 },
  { id: 'cat-conceptual', name: 'Conceptual Projects', slug: 'conceptual-projects', displayOrder: 5 },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-kunsthalle-basel',
    title: 'Kunsthalle Nord Atrium',
    slug: 'kunsthalle-nord-atrium',
    category: 'Commercial Architecture',
    location: 'Basel, Switzerland',
    year: '2024',
    summary:
      'A civic contemporary art foundation organized around a sculptural helical stair and north-facing louver roof.',
    description:
      'Designed as a daylight-calibrated vessel for large-scale sculpture, Kunsthalle Nord centers on a 22-meter triple-height atrium. Deep precast concrete roof louvers filter harsh zenithal sun into rhythmic bands across honed Roman travertine flooring, guiding visitors up a self-supporting helical concrete stair.',
    area: '4,800 sqm',
    client: 'Stiftung Kunsthalle Nord',
    thumbnailUrl: projectAtriumImg,
    thumbnailAlt: 'Monumental museum atrium with helical concrete staircase and skylight louvers',
    gallery: [
      {
        url: projectAtriumImg,
        alt: 'Central atrium and helical stair',
        caption: 'Daylight louvers casting measured solar geometry across the travertine court.',
      },
      {
        url: projectInteriorImg,
        alt: 'Private patron reading room',
        caption: 'Adjoining quiet gallery finished in raw lime plaster and blackened steel.',
      },
    ],
    published: true,
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'proj-mesa-villa',
    title: 'Casa Piedra Blanca',
    slug: 'casa-piedra-blanca',
    category: 'Residential Architecture',
    location: 'Santa Fe, United States',
    year: '2024',
    summary:
      'Low-slung monolithic desert villa organized around an elongated basalt reflection basin.',
    description:
      'Embedded quietly beneath piñon pines at 2,200 meters elevation, Casa Piedra Blanca uses thick insulated architectural concrete walls for passive thermal mass. A 28-meter mirror pool cools prevailing desert breezes before they cross shaded limestone terraces.',
    area: '720 sqm',
    client: 'Private Commission',
    thumbnailUrl: projectMonolithImg,
    thumbnailAlt: 'Minimalist concrete villa reflected in dark rectangular pool',
    gallery: [
      {
        url: projectMonolithImg,
        alt: 'Courtyard reflection pool and concrete overhang',
        caption: 'Thermal mass concrete roof plane shielding western desert glare.',
      },
      {
        url: heroCantileverImg,
        alt: 'Cantilevered overlook terrace',
        caption: 'Upper ridge terrace projecting toward the Sangre de Cristo range.',
      },
    ],
    published: true,
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'proj-mercer-loft',
    title: 'Mercer Street Gallery Residence',
    slug: 'mercer-street-gallery-residence',
    category: 'Interior Design',
    location: 'New York, United States',
    year: '2023',
    summary:
      'Monochromatic adaptive reuse of an 1890 cast-iron loft featuring raw lime plaster and hand-carved stone.',
    description:
      'Stripping back a century of partitions revealed soaring 4.5-meter volumes. We introduced blackened steel portal frames, recessed shadow-gap baseboards, smoked European oak joinery, and a two-ton cleft basalt hearth as the quiet anchor of the living gallery.',
    area: '410 sqm',
    client: 'Private Collector',
    thumbnailUrl: projectVerticalInteriorImg,
    thumbnailAlt: 'Minimalist loft interior with towering cleft basalt fireplace and blackened steel windows',
    gallery: [
      {
        url: projectVerticalInteriorImg,
        alt: 'Living gallery and monolithic basalt hearth',
        caption: 'Double-height blackened steel glazing and cleft stone hearth under morning raking light.',
      },
      {
        url: projectInteriorImg,
        alt: 'Reading lounge detail',
        caption: 'Custom blackened steel shelving and smoked oak flooring in the adjoining gallery.',
      },
    ],
    published: true,
    featured: false,
    displayOrder: 3,
  },
  {
    id: 'proj-kyoto-sanctuary',
    title: 'Kamo Basalt Water Court',
    slug: 'kamo-basalt-water-court',
    category: 'Landscape Architecture',
    location: 'Kyoto, Japan',
    year: '2023',
    summary:
      'A contemplative architectural courtyard uniting concrete colonnades, split basalt, and ancient black pine.',
    description:
      'Conceived as an acoustic buffer within dense urban Kyoto, this cloistered garden frames sky and water reflection. Hand-dressed basalt pavers transition seamlessly into a zero-edge mirror basin bordered by weathered board-formed concrete piers.',
    area: '1,150 sqm',
    client: 'Aoyama Cultural Retreat',
    thumbnailUrl: projectCourtyardImg,
    thumbnailAlt: 'Concrete colonnade overlooking dark basalt reflection pond and black pine',
    gallery: [
      {
        url: projectCourtyardImg,
        alt: 'Colonnade and mirror water court',
        caption: 'Still water court calibrated to double the perceived verticality of the colonnade.',
      },
    ],
    published: true,
    featured: false,
    displayOrder: 4,
  },
  {
    id: 'proj-nordic-monolith',
    title: 'Tidal Observatory VII',
    slug: 'tidal-observatory-vii',
    category: 'Conceptual Projects',
    location: 'Vik, Iceland',
    year: '2026',
    summary:
      'Speculative brutalist coastal tower designed to register Atlantic tide cycles and sub-arctic mist.',
    description:
      'An architectural research monograph investigating acoustic resonance and vertical light shafts in volcanic-aggregate concrete. Deeply recessed apertures frame horizon lines while sheltering interior stair chambers from North Atlantic gales.',
    area: '1,900 sqm',
    client: 'Studio Research Monograph',
    thumbnailUrl: projectVerticalTowerImg,
    thumbnailAlt: 'Brutalist concrete monolith observatory tower perched on basalt ocean cliffs',
    gallery: [
      {
        url: projectVerticalTowerImg,
        alt: 'Monolith tower on basalt sea cliffs',
        caption: 'Volumetric massing study examining recessed vertical shadow wells above Atlantic surf.',
      },
      {
        url: projectConceptualImg,
        alt: 'Monolith study in coastal fog',
        caption: 'Atmospheric North Atlantic fog integration along the seaward concrete facade.',
      },
    ],
    published: true,
    featured: false,
    displayOrder: 5,
  },
  {
    id: 'proj-lake-lucerne',
    title: 'Pavilion am Vierwaldstättersee',
    slug: 'pavilion-am-vierwaldstattersee',
    category: 'Residential Architecture',
    location: 'Lucerne, Switzerland',
    year: '2025',
    summary:
      'A cantilevered board-formed concrete residence anchored into alpine granite above Lake Lucerne.',
    description:
      'Anchored twelve meters into coastal bedrock, Pavilion am Vierwaldstättersee projects horizontally over shifting lake mist through a post-tensioned 14-meter concrete cantilever. Floor-to-ceiling low-iron glazing framed in thermally broken blackened steel dissolves the threshold between alpine rock and water.',
    area: '640 sqm',
    client: 'Private Commission',
    thumbnailUrl: heroCantileverImg,
    thumbnailAlt: 'Cantilevered concrete pavilion overlooking misty Lake Lucerne',
    gallery: [
      {
        url: heroCantileverImg,
        alt: 'West elevation cantilever over the lake',
        caption: 'Primary structural cantilever extending toward the western horizon.',
      },
    ],
    published: false,
    featured: false,
    displayOrder: 6,
  },
];

export const DEFAULT_PHILOSOPHY: PhilosophyItem[] = [
  {
    id: 'phil-01',
    number: '01',
    title: 'Context & Environment',
    description:
      'Every structure begins as a quiet reading of geology, wind, and solar arc. Architecture must belong exclusively to the topography it inhabits.',
    displayOrder: 1,
  },
  {
    id: 'phil-02',
    number: '02',
    title: 'Form & Function',
    description:
      'Spatial clarity emerges when circulation, structure, and proportion fuse into a single gesture—eliminating ornament until only necessity remains.',
    displayOrder: 2,
  },
  {
    id: 'phil-03',
    number: '03',
    title: 'Material & Texture',
    description:
      'We specify honest materials—board-formed concrete, cleft basalt, blackened steel, and oiled timber—that deepen in character across decades.',
    displayOrder: 3,
  },
  {
    id: 'phil-04',
    number: '04',
    title: 'Sustainable Thinking',
    description:
      'Longevity is the highest form of sustainability. Passive thermal mass, geothermal exchange, and low-carbon mineral mixes guide every detail.',
    displayOrder: 4,
  },
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-01',
    title: 'Architectural Design',
    description:
      'Full-scope conceptual, schematic, and technical architectural direction for bespoke cultural and private commissions.',
    deliverables: ['Feasibility & Site Analysis', 'Concept & Massing Studies', 'Construction Documentation'],
    displayOrder: 1,
  },
  {
    id: 'srv-02',
    title: 'Residential Planning',
    description:
      'Bespoke monolithic residences, alpine retreats, and coastal villas calibrated around privacy, daylight, and landscape.',
    deliverables: ['Master Site Planning', 'Custom Structural Detailing', 'Contractor Bidding & Oversight'],
    displayOrder: 2,
  },
  {
    id: 'srv-03',
    title: 'Commercial Architecture',
    description:
      'Museums, boutique hospitality, flagship galleries, and headquarters built for civic permanence and spatial poise.',
    deliverables: ['Programmatic Strategy', 'Code & Zoning Coordination', 'Turnkey Execution'],
    displayOrder: 3,
  },
  {
    id: 'srv-04',
    title: 'Interior Design',
    description:
      'Cohesive interior architecture integrating custom stone hearths, architectural lighting, acoustic plaster, and bespoke millwork.',
    deliverables: ['Material & Finish Curation', 'Custom Furniture Fabrication', 'Lighting Choreography'],
    displayOrder: 4,
  },
  {
    id: 'srv-05',
    title: '3D Visualization',
    description:
      'Photometric daylight simulations, physical timber and plaster scale models, and atmospheric monograph renderings.',
    deliverables: ['Solar & Shadow Studies', 'High-Resolution Visualizations', 'Physical Scale Models'],
    displayOrder: 5,
  },
  {
    id: 'srv-06',
    title: 'Consultation',
    description:
      'Pre-acquisition site due diligence, adaptive reuse assessments, and architectural peer reviews for international developers.',
    deliverables: ['Land Acquisition Audits', 'Heritage Adaptive Reuse', 'Design Advisory'],
    displayOrder: 6,
  },
];

export const DEFAULT_STATS: StatItem[] = [
  {
    id: 'stat-01',
    label: 'Years of Experience',
    value: 18,
    suffix: '+',
    context: 'Zurich, New York & Tokyo',
    displayOrder: 1,
  },
  {
    id: 'stat-02',
    label: 'Completed Projects',
    value: 64,
    suffix: '',
    context: 'Residential & Cultural Works',
    displayOrder: 2,
  },
  {
    id: 'stat-03',
    label: 'Satisfied Clients',
    value: 48,
    suffix: '',
    context: 'Private & Institutional Patrons',
    displayOrder: 3,
  },
  {
    id: 'stat-04',
    label: 'Design Awards',
    value: 27,
    suffix: '',
    context: 'RIBA, SIA & AIA Honors',
    displayOrder: 4,
  },
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-01',
    clientName: 'Dr. Lukas Weber',
    designation: 'Director, Stiftung Kunsthalle Nord',
    quote:
      'Voss & Kerr transformed an unforgiving post-industrial site into an atrium of astonishing calm. Visitors routinely pause in silence beneath the louver skylights before viewing a single artwork.',
    avatarUrl: '',
    projectRef: 'Kunsthalle Nord Atrium',
    displayOrder: 1,
  },
  {
    id: 'test-02',
    clientName: 'Catherine & Henrik Lind',
    designation: 'Private Residential Patrons, Lucerne',
    quote:
      'Their mastery of concrete proportion and natural light gave our lakeside home the stillness of a cliffside sanctuary without sacrificing warmth or effortless daily living.',
    avatarUrl: '',
    projectRef: 'Pavilion am Vierwaldstättersee',
    displayOrder: 2,
  },
  {
    id: 'test-03',
    clientName: 'Kenji Takahashi',
    designation: 'Managing Partner, Aoyama Cultural Trust',
    quote:
      'Rarely does an international studio demonstrate such reverence for stone craft, joinery tolerances, and seasonal shadow. Every millimeter on site matched the architectural drawings.',
    avatarUrl: '',
    projectRef: 'Kamo Basalt Water Court',
    displayOrder: 3,
  },
];

export const DEFAULT_MEDIA: MediaAsset[] = [
  {
    id: 'media-hero',
    name: 'Hero Cantilever Pavilion',
    url: heroCantileverImg,
    alt: 'Cantilevered board-formed concrete and glass pavilion overlooking misty water',
    width: 1600,
    height: 900,
    sizeKb: 240,
    originalSizeKb: 240,
    mimeType: 'image/jpeg',
  },
  {
    id: 'media-portrait',
    name: 'Clara Voss Studio Portrait',
    url: architectPortraitImg,
    alt: 'Principal architect Clara Voss in concrete architectural studio',
    width: 1200,
    height: 1600,
    sizeKb: 210,
    originalSizeKb: 210,
    mimeType: 'image/jpeg',
  },
  {
    id: 'media-residence',
    name: 'Casa Piedra Blanca',
    url: projectMonolithImg,
    alt: 'Monolithic concrete desert residence with reflection pool',
    width: 1600,
    height: 1200,
    sizeKb: 230,
    originalSizeKb: 230,
    mimeType: 'image/jpeg',
  },
  {
    id: 'media-atrium',
    name: 'Kunsthalle Nord Atrium',
    url: projectAtriumImg,
    alt: 'Museum concrete atrium and helical staircase',
    width: 1600,
    height: 1200,
    sizeKb: 245,
    originalSizeKb: 245,
    mimeType: 'image/jpeg',
  },
  {
    id: 'media-interior',
    name: 'Mercer Street Gallery Interior',
    url: projectVerticalInteriorImg,
    alt: 'Minimalist loft interior with towering monolithic basalt fireplace',
    width: 1200,
    height: 1600,
    sizeKb: 225,
    originalSizeKb: 225,
    mimeType: 'image/jpeg',
  },
  {
    id: 'media-courtyard',
    name: 'Kamo Basalt Water Court',
    url: projectCourtyardImg,
    alt: 'Basalt reflection courtyard with concrete colonnade and black pine',
    width: 1600,
    height: 1200,
    sizeKb: 235,
    originalSizeKb: 235,
    mimeType: 'image/jpeg',
  },
  {
    id: 'media-concept',
    name: 'Tidal Observatory VII',
    url: projectVerticalTowerImg,
    alt: 'Conceptual brutalist concrete tower on basalt ocean cliffs',
    width: 1066,
    height: 1600,
    sizeKb: 215,
    originalSizeKb: 215,
    mimeType: 'image/jpeg',
  },
];
