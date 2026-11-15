import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { distributeMasonryColumns, filterAndSortProjects } from '../../lib/portfolioLogic';
import type { Category, Project } from '../../types/portfolio';
import { ResilientImage } from './ResilientImage';

interface ProjectsSectionProps {
  projects: Project[];
  categories: Category[];
  onSelectProject: (project: Project) => void;
  includeUnpublished?: boolean;
}

function useResponsiveColumnCount(): number {
  const [columns, setColumns] = useState<number>(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  });

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setColumns(3);
      else if (window.innerWidth >= 768) setColumns(2);
      else setColumns(1);
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  return columns;
}

export function ProjectsSection({
  projects,
  categories,
  onSelectProject,
  includeUnpublished = false,
}: ProjectsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const prefersReducedMotion = useReducedMotion();
  const columnCount = useResponsiveColumnCount();

  const visibleProjects = filterAndSortProjects(projects, selectedCategory, includeUnpublished);
  const categoryNames = ['All', ...categories.map((c) => c.name)];
  const masonryColumns = distributeMasonryColumns(visibleProjects, columnCount);

  return (
    <section id="projects" className="bg-[#F5F5F5] text-black py-24 md:py-36 border-b border-[#E5E5E5]">
      <div className="max-w-[1380px] mx-auto px-6 md:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-[#E5E5E5]">
          <div>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#595959] mb-4">
              Selected Monograph
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-black [text-wrap:balance]">
              Featured Projects
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="flex flex-wrap items-center gap-2"
          >
            {categoryNames.map((name) => {
              const active = selectedCategory === name;
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(name)}
                  className={`px-4 py-2 text-xs font-medium tracking-wide whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
                    active
                      ? 'bg-black text-white'
                      : 'bg-white text-[#222222] border border-[#E5E5E5] hover:border-black'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="py-24 text-center border-b border-[#E5E5E5]">
            <p className="font-serif text-2xl text-black mb-2">
              No published works in this discipline yet.
            </p>
            <p className="text-sm text-[#595959]">
              Select another category to explore the studio archive.
            </p>
          </div>
        ) : (
          <div
            data-testid="projects-masonry"
            className="mt-14 flex items-start gap-8"
          >
            {masonryColumns.map((columnProjects, colIndex) => (
              <div
                key={colIndex}
                className="flex-1 min-w-0 flex flex-col gap-12 md:gap-14"
              >
                {columnProjects.map((project, itemIndex) => {
                  const globalIndex = itemIndex * masonryColumns.length + colIndex;
                  return (
                    <motion.article
                      key={project.id}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{
                        duration: 0.55,
                        delay: Math.min(globalIndex * 0.05, 0.2),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="group bg-white border border-[#E5E5E5] transition-colors duration-200 hover:border-black"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectProject(project)}
                        aria-label={`Inspect project ${project.title}`}
                        className="w-full text-left block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black cursor-pointer"
                      >
                        <div className="relative w-full overflow-hidden bg-[#222222]">
                          <ResilientImage
                            src={project.thumbnailUrl}
                            alt={project.thumbnailAlt || project.title}
                            fallbackTitle={project.title}
                            className="w-full h-auto block object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300"
                          />
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-black px-3.5 py-2 text-xs font-medium tracking-wider uppercase inline-flex items-center gap-1.5">
                            <span>View Dossier</span>
                            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#595959] mb-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>{project.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{project.location}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{project.year}</span>
                            </div>
                            {project.area && (
                              <span className="tabular-nums shrink-0">{project.area}</span>
                            )}
                          </div>

                          <h3 className="font-serif text-2xl text-black group-hover:underline underline-offset-4 decoration-1">
                            {project.title}
                          </h3>

                          <p className="mt-2.5 text-sm text-[#222222] leading-relaxed">
                            {project.summary}
                          </p>
                        </div>
                      </button>
                    </motion.article>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
