import { motion, useReducedMotion } from 'motion/react';
import type { SiteSettings } from '../../types/portfolio';
import { ResilientImage } from './ResilientImage';

interface AboutSectionProps {
  settings: SiteSettings;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="about" className="bg-white text-black py-24 md:py-36 border-b border-[#E5E5E5]">
      <div className="max-w-[1380px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[3/4] lg:h-full lg:min-h-[560px] w-full overflow-hidden bg-[#F5F5F5]">
              <ResilientImage
                src={settings.aboutPortraitUrl}
                alt={settings.aboutPortraitAlt || `${settings.studioName} Principal Architect`}
                fallbackTitle={settings.studioName}
                className="w-full h-full object-cover object-top"
              />
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#595959] mb-4">
                {settings.aboutEyebrow || 'The Practice'}
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-black [text-wrap:balance] mb-8">
                {settings.aboutTitle}
              </h2>

              <p className="text-base md:text-lg text-[#222222] leading-relaxed mb-8 max-w-2xl">
                {settings.aboutBio}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#E5E5E5]">
                <div>
                  <h3 className="text-xs font-mono tracking-wider uppercase text-[#595959] mb-3">
                    Architectural Philosophy
                  </h3>
                  <p className="text-sm text-[#222222] leading-relaxed">
                    {settings.aboutPhilosophy}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-mono tracking-wider uppercase text-[#595959] mb-3">
                    Design Approach
                  </h3>
                  <p className="text-sm text-[#222222] leading-relaxed">
                    {settings.aboutApproach}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-12 gap-8 items-start">
              <div className="sm:col-span-4">
                <div className="font-mono text-4xl md:text-5xl font-medium tabular-nums text-black">
                  {settings.aboutExperienceYears}+
                </div>
                <p className="text-xs font-mono tracking-wider uppercase text-[#595959] mt-2">
                  Years of Practice
                </p>
              </div>

              <div className="sm:col-span-8">
                <h3 className="text-xs font-mono tracking-wider uppercase text-[#595959] mb-3">
                  Credentials &amp; Recognition
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-[#222222]">
                  {(settings.aboutCredentials || []).map((cred, idx) => (
                    <li key={idx} className="py-1 border-b border-[#F5F5F5]">
                      {cred}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
