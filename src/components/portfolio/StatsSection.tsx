import { useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { StatItem } from '../../types/portfolio';

interface StatsSectionProps {
  stats: StatItem[];
}

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? target : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(target);
      return;
    }
    if (!inView) return;

    let frameId = 0;
    const duration = 1100;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [inView, target, prefersReducedMotion]);

  return (
    <span ref={ref} className="font-mono text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight tabular-nums text-white">
      {displayValue}
      {suffix}
    </span>
  );
}

export function StatsSection({ stats }: StatsSectionProps) {
  if (stats.length === 0) return null;

  return (
    <section aria-label="Studio achievements" className="bg-black text-white py-20 md:py-28 border-b border-[#222222]">
      <div className="max-w-[1380px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="border-t border-[#222222] pt-6">
              <AnimatedCounter target={stat.value} suffix={stat.suffix || ''} />
              <h3 className="mt-4 text-sm font-medium tracking-wide text-white">
                {stat.label}
              </h3>
              {stat.context && (
                <p className="mt-1 text-xs font-mono text-white/60">
                  {stat.context}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
