import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ServiceItem } from '../../types/portfolio';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectService?: (serviceTitle: string) => void;
}

export function ServicesSection({ services, onSelectService }: ServicesSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="services" className="bg-[#F5F5F5] text-black py-24 md:py-36 border-b border-[#E5E5E5]">
      <div className="max-w-[1380px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-14 border-b border-[#E5E5E5]">
          <div>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#595959] mb-4">
              Capabilities
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-black [text-wrap:balance]">
              Architectural Services
            </h2>
          </div>
          <p className="text-sm md:text-base text-[#222222] max-w-md leading-relaxed">
            Comprehensive architectural stewardship from land evaluation through bespoke interior fabrication.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#E5E5E5]">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white border-r border-b border-[#E5E5E5] p-8 md:p-10 flex flex-col justify-between transition-colors duration-200 hover:bg-black hover:text-white"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-xs tabular-nums text-[#595959] group-hover:text-white/60 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {onSelectService && (
                    <button
                      type="button"
                      onClick={() => onSelectService(service.title)}
                      aria-label={`Inquire about ${service.title}`}
                      className="text-[#595959] group-hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="font-serif text-2xl mb-4">
                  {service.title}
                </h3>

                <p className="text-sm text-[#222222] group-hover:text-white/80 leading-relaxed mb-8 transition-colors">
                  {service.description}
                </p>
              </div>

              {service.deliverables && service.deliverables.length > 0 && (
                <ul className="pt-6 border-t border-[#E5E5E5] group-hover:border-white/20 space-y-2 text-xs font-mono text-[#595959] group-hover:text-white/75 transition-colors">
                  {service.deliverables.map((del, dIdx) => (
                    <li key={dIdx}>{del}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
