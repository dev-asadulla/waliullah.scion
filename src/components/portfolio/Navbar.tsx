import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { SiteSettings } from '../../types/portfolio';
import { StudioLogo } from './StudioLogo';

interface NavbarProps {
  settings: SiteSettings;
}

export function Navbar({ settings }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 48);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: settings.navLabels.home || 'Home', href: '#home', visible: settings.sectionVisibility.hero },
    { label: settings.navLabels.about || 'About', href: '#about', visible: settings.sectionVisibility.about },
    { label: settings.navLabels.projects || 'Projects', href: '#projects', visible: settings.sectionVisibility.projects },
    { label: settings.navLabels.services || 'Services', href: '#services', visible: settings.sectionVisibility.services },
    { label: settings.navLabels.contact || 'Contact', href: '#contact', visible: settings.sectionVisibility.contact },
  ].filter((item) => item.visible);

  const handleLinkClick = (href: string) => {
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled || mobileOpen
          ? 'bg-white/95 backdrop-blur-sm text-black border-b border-[#E5E5E5]'
          : 'bg-transparent text-white border-b border-white/15'
      }`}
    >
      <div className="max-w-[1380px] mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between gap-8">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('#home');
          }}
          className="inline-flex items-center gap-3 font-serif text-xl md:text-2xl tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
        >
          <StudioLogo
            studioName={settings.studioName}
            logoMark={settings.logoMark}
            logoImageUrl={settings.logoImageUrl}
            surface={scrolled || mobileOpen ? 'light' : 'dark'}
            size="sm"
          />
          <span>{settings.studioName}</span>
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.href);
              }}
              className={`relative py-1 whitespace-nowrap shrink-0 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 ${
                scrolled ? 'text-[#222222]' : 'text-white/90'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('#contact');
            }}
            className={`hidden md:inline-flex items-center justify-center px-5 py-2.5 text-xs font-medium tracking-wider uppercase whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 ${
              scrolled
                ? 'bg-black text-white hover:bg-[#222222]'
                : 'bg-white text-black hover:bg-[#E5E5E5]'
            }`}
          >
            {settings.navLabels.cta || "Let's Talk"}
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white text-black border-t border-[#E5E5E5] px-6 py-8">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.href);
                }}
                className="py-3 text-lg font-serif border-b border-[#E5E5E5] text-black hover:text-[#555555] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('#contact');
              }}
              className="mt-6 inline-flex items-center justify-center w-full py-3.5 bg-black text-white text-xs font-medium tracking-wider uppercase"
            >
              {settings.navLabels.cta || "Let's Talk"}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
