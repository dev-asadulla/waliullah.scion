import { useEffect, useState } from 'react';
import { AdminApp } from './components/admin/AdminApp';
import { AboutSection } from './components/portfolio/AboutSection';
import { ContactSection } from './components/portfolio/ContactSection';
import { Footer } from './components/portfolio/Footer';
import { HeroSection } from './components/portfolio/HeroSection';
import { Navbar } from './components/portfolio/Navbar';
import { PhilosophySection } from './components/portfolio/PhilosophySection';
import { ProjectModal } from './components/portfolio/ProjectModal';
import { ProjectsSection } from './components/portfolio/ProjectsSection';
import { ServicesSection } from './components/portfolio/ServicesSection';
import { StatsSection } from './components/portfolio/StatsSection';
import { TestimonialsSection } from './components/portfolio/TestimonialsSection';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PHILOSOPHY,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_TESTIMONIALS,
} from './data/seedPortfolio';
import { subscribePublicPortfolio, type PublicPortfolioState } from './lib/portfolioService';
import type { Project } from './types/portfolio';

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export default function App() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);
  const isAdminPreviewFrame =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('adminPreview') === '1' &&
    window.parent !== window;

  const [portfolio, setPortfolio] = useState<PublicPortfolioState>({
    settings: DEFAULT_SITE_SETTINGS,
    projects: DEFAULT_PROJECTS.filter((p) => p.published),
    categories: DEFAULT_CATEGORIES,
    philosophy: DEFAULT_PHILOSOPHY,
    services: DEFAULT_SERVICES,
    stats: DEFAULT_STATS,
    testimonials: DEFAULT_TESTIMONIALS,
    loadedFromFirestore: false,
  });
  const [previewIncludeDrafts, setPreviewIncludeDrafts] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [preselectedDiscipline, setPreselectedDiscipline] = useState<string | undefined>(undefined);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const unsub = subscribePublicPortfolio((nextState) => {
      setPortfolio((prev) => (isAdminPreviewFrame && prev.loadedFromFirestore ? prev : nextState));
    });
    return () => unsub();
  }, [isAdminPreviewFrame]);

  useEffect(() => {
    if (!isAdminPreviewFrame) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'STUDIO_PREVIEW_STATE' && msg.payload) {
        setPortfolio({
          ...msg.payload.state,
          loadedFromFirestore: true,
        });
        setPreviewIncludeDrafts(Boolean(msg.payload.includeDrafts));
      } else if (msg.type === 'STUDIO_PREVIEW_SCROLL' && typeof msg.sectionId === 'string') {
        const el = document.getElementById(msg.sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'STUDIO_PREVIEW_READY' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, [isAdminPreviewFrame]);

  // Sync dynamic SEO title, description, and favicon from CMS settings
  useEffect(() => {
    const { seoTitle, seoDescription, faviconUrl, logoImageUrl } = portfolio.settings;
    if (seoTitle) {
      document.title = isAdminPath(pathname) ? `Studio CMS — ${portfolio.settings.studioName}` : seoTitle;
    }
    if (seoDescription) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', seoDescription);
    }
    const activeIcon = (faviconUrl || logoImageUrl || '').trim();
    if (activeIcon.length > 0) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (link) link.href = activeIcon;
    }
  }, [portfolio.settings, pathname]);

  const navigateTo = (targetPath: string) => {
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
      setPathname(targetPath);
      window.scrollTo({ top: 0 });
    }
  };

  if (isAdminPath(pathname)) {
    return <AdminApp onNavigateHome={() => navigateTo('/')} />;
  }

  const { settings, projects, categories, philosophy, services, stats, testimonials } = portfolio;
  const vis = settings.sectionVisibility;

  const handleInquireFromContext = (disciplineOrProject: string) => {
    setSelectedProject(null);
    setPreselectedDiscipline(disciplineOrProject);
    const contactEl = document.querySelector('#contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar settings={settings} />

      <main>
        {vis.hero && <HeroSection settings={settings} />}

        {vis.about && <AboutSection settings={settings} />}

        {vis.projects && (
          <ProjectsSection
            projects={projects}
            categories={categories}
            includeUnpublished={isAdminPreviewFrame && previewIncludeDrafts}
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        )}

        {vis.philosophy && <PhilosophySection items={philosophy} />}

        {vis.services && (
          <ServicesSection
            services={services}
            onSelectService={(srvTitle) => handleInquireFromContext(srvTitle)}
          />
        )}

        {vis.stats && <StatsSection stats={stats} />}

        {vis.testimonials && <TestimonialsSection testimonials={testimonials} />}

        {vis.contact && (
          <ContactSection
            settings={settings}
            categories={categories}
            preselectedProjectType={preselectedDiscipline}
          />
        )}
      </main>

      <Footer settings={settings} onNavigateAdmin={() => navigateTo('/admin')} />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onInquireAboutProject={(projectTitle) => handleInquireFromContext(projectTitle)}
      />
    </div>
  );
}
