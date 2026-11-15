import { motion, useReducedMotion } from 'motion/react';
import type { PhilosophyItem } from '../../types/portfolio';

interface PhilosophySectionProps {
  items: PhilosophyItem[];
}

export function PhilosophySection({ items }: PhilosophySectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="philosophy" className="bg-white text-black py-24 md:py-36 border-b border-[#E5E5E5]">
      <div className="max-w-[1380px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-[#E5E5E5]">
          <div className="lg:col-span-5">
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#595959] mb-4">
              Design Philosophy
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-black [text-wrap:balance]">
              Four Principles of Spatial Permanence
            </h2>
          </div>
          <div className="lg:col-span-7 flex items-end">
            <p className="text-base text-[#222222] leading-relaxed max-w-2xl">
              Architecture endures when structure, daylight, and material honesty are resolved without artifice. These four disciplines anchor every commission from feasibility to handover.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#E5E5E5]">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
              className="group py-10 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline transition-colors duration-200 hover:bg-[#F5F5F5] px-2 md:px-4 -mx-2 md:-mx-4"
            >
              <div className="md:col-span-3">
                <span className="font-mono text-4xl md:text-6xl font-normal tracking-tighter tabular-nums text-[#808080] group-hover:text-black transition-colors duration-200">
                  {item.number}
                </span>
              </div>

              <div className="md:col-span-4">
                <h3 className="font-serif text-2xl md:text-3xl text-black">
                  {item.title}
                </h3>
              </div>

              <div className="md:col-span-5">
                <p className="text-sm md:text-base text-[#222222] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
