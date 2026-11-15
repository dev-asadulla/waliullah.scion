import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import type { SiteSettings } from '../../types/portfolio';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  settings: SiteSettings;
}

export function HeroSection({ settings }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

  const scrollToSection = (selector: string) => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden bg-black text-white flex flex-col justify-end"
    >
      <motion.div
        style={prefersReducedMotion ? undefined : { y: imageY }}
        className="absolute inset-0 scale-105 will-change-transform"
      >
        <ResilientImage
          src={settings.heroImageUrl}
          alt={settings.heroImageAlt || settings.heroTitle}
          loading="eager"
          fallbackTitle={settings.studioName}
          className="w-full h-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35"
        />
      </motion.div>

      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-6 md:px-10 pt-28 pb-12 md:pb-16">
        <div className="max-w-4xl">
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs font-mono tracking-[0.22em] uppercase text-white/80 mb-5"
          >
            {settings.studioName} · Architecture &amp; Spatial Practice
          </motion.p>

          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-4xl sm:text-6xl lg:text-[4.5rem] leading-[1.03] tracking-tight text-white [text-wrap:balance] mb-6"
          >
            {settings.heroTitle}
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-white/85 max-w-2xl leading-relaxed mb-10"
          >
            {settings.heroSubtitle}
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => scrollToSection('#projects')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-black text-xs font-medium tracking-wider uppercase hover:bg-[#E5E5E5] transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Explore Projects</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('#contact')}
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/60 text-white text-xs font-medium tracking-wider uppercase hover:bg-white hover:text-black transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Get in Touch</span>
            </button>
          </motion.div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-white/75">
          <span className="font-mono tracking-wider uppercase">
            {settings.contactLocation}
          </span>
          <button
            type="button"
            onClick={() => scrollToSection('#about')}
            aria-label="Scroll to studio introduction"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase hover:text-white transition-colors cursor-pointer"
          >
            <span>Scroll</span>
            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
