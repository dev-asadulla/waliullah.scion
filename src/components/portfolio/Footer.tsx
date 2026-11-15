import { ArrowUp } from 'lucide-react';
import type { SiteSettings } from '../../types/portfolio';
import { StudioLogo } from './StudioLogo';

interface FooterProps {
  settings: SiteSettings;
  onNavigateAdmin: () => void;
}

export function Footer({ settings, onNavigateAdmin }: FooterProps) {
  const navItems = [
    { label: settings.navLabels.home || 'Home', href: '#home' },
    { label: settings.navLabels.about || 'About', href: '#about' },
    { label: settings.navLabels.projects || 'Projects', href: '#projects' },
    { label: settings.navLabels.services || 'Services', href: '#services' },
    { label: settings.navLabels.contact || 'Contact', href: '#contact' },
  ];

  const socialItems = [
    { label: 'Instagram', url: settings.socialLinks.instagram },
    { label: 'LinkedIn', url: settings.socialLinks.linkedin },
    { label: 'ArchDaily', url: settings.socialLinks.archdaily },
    { label: 'Behance', url: settings.socialLinks.behance },
  ].filter((item) => item.url && item.url.trim().length > 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white border-t border-[#222222]">
      <div className="max-w-[1380px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#222222]">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <StudioLogo
                studioName={settings.studioName}
                logoMark={settings.logoMark}
                logoImageUrl={settings.logoImageUrl}
                surface="dark"
                size="md"
              />
              <span className="font-serif text-2xl tracking-tight">{settings.studioName}</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              {settings.footerDescription}
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-mono tracking-wider uppercase text-white/50 mb-4">
              Index
            </h3>
            <ul className="space-y-2.5 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-mono tracking-wider uppercase text-white/50 mb-4">
              Channels
            </h3>
            <ul className="space-y-2.5 text-sm">
              {socialItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-mono tracking-wider uppercase text-white/50 mb-4">
              Studio Contact
            </h3>
            <div className="space-y-2 text-sm text-white/80">
              <p>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                  {settings.contactEmail}
                </a>
              </p>
              <p className="font-mono tabular-nums">{settings.contactPhone}</p>
              <p className="text-white/60 text-xs leading-relaxed pt-1">
                {settings.contactLocation}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex flex-wrap items-center gap-4">
            <span>{settings.copyrightText}</span>
            <span aria-hidden="true">·</span>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigateAdmin();
              }}
              className="font-mono uppercase tracking-wider text-white/70 hover:text-white transition-colors"
            >
              Studio CMS
            </a>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="inline-flex items-center gap-2 font-mono uppercase tracking-wider text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
