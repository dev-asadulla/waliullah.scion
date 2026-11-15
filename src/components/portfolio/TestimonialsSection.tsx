import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import type { Testimonial } from '../../types/portfolio';
import { ResilientImage } from './ResilientImage';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  if (testimonials.length === 0) return null;

  const safeIndex = currentIndex % testimonials.length;
  const current = testimonials[safeIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const initials = current.clientName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
    .toUpperCase();

  return (
    <section id="testimonials" className="bg-white text-black py-24 md:py-36 border-b border-[#E5E5E5]">
      <div className="max-w-[1380px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            <div>
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#595959] mb-4">
                Client Perspectives
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-black [text-wrap:balance]">
                Voices From Built Works
              </h2>
            </div>

            {testimonials.length > 1 && (
              <div className="mt-10 flex items-center gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous testimonial"
                  className="w-11 h-11 border border-[#E5E5E5] flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next testimonial"
                  className="w-11 h-11 border border-[#E5E5E5] flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="ml-2 text-xs font-mono tabular-nums text-[#595959]">
                  {String(safeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={current.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-[#E5E5E5] pt-8"
              >
                <p className="font-serif text-2xl sm:text-3xl md:text-[2.1rem] leading-[1.32] text-black mb-10">
                  “{current.quote}”
                </p>

                <footer className="flex items-center gap-4">
                  {current.avatarUrl ? (
                    <div className="w-12 h-12 overflow-hidden bg-[#F5F5F5] shrink-0">
                      <ResilientImage
                        src={current.avatarUrl}
                        alt={current.clientName}
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="w-12 h-12 bg-black text-white font-mono text-xs flex items-center justify-center shrink-0"
                    >
                      {initials}
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-semibold text-black">
                      {current.clientName}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#595959] mt-0.5">
                      <span>{current.designation}</span>
                      {current.projectRef && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{current.projectRef}</span>
                        </>
                      )}
                    </div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
