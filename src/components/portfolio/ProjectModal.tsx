import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Project } from '../../types/portfolio';
import { ResilientImage } from './ResilientImage';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onInquireAboutProject: (projectTitle: string) => void;
}

export function ProjectModal({
  project,
  onClose,
  onInquireAboutProject,
}: ProjectModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  if (!project) return null;

  const images = [
    {
      url: project.thumbnailUrl,
      alt: project.thumbnailAlt || project.title,
      caption: project.summary,
    },
    ...(project.gallery || []).filter((g) => g.url && g.url !== project.thumbnailUrl),
  ];

  const activeImage = images[activeIndex] || images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-0 md:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white text-black w-full max-w-6xl min-h-screen md:min-h-0 md:max-h-[92vh] overflow-y-auto border border-[#E5E5E5]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#E5E5E5] px-6 md:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-mono text-[#595959] truncate">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{project.year}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project dossier"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-black hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            <span>Close</span>
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 md:p-10">
          <div className="relative aspect-[16/10] w-full bg-[#222222] overflow-hidden mb-4">
            <ResilientImage
              src={activeImage.url}
              alt={activeImage.alt}
              fallbackTitle={project.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                  aria-label="Previous project photograph"
                  className="pointer-events-auto w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-[#E5E5E5] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="bg-black/80 text-white px-3 py-1 text-xs font-mono tabular-nums">
                  {activeIndex + 1} / {images.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                  aria-label="Next project photograph"
                  className="pointer-events-auto w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-[#E5E5E5] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {activeImage.caption && (
            <p className="text-xs font-mono text-[#595959] mb-8">{activeImage.caption}</p>
          )}

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-6 mb-8 border-b border-[#E5E5E5]">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`View image ${idx + 1} of ${project.title}`}
                  className={`relative w-24 h-16 shrink-0 overflow-hidden border transition-opacity cursor-pointer ${
                    idx === activeIndex ? 'border-black opacity-100' : 'border-[#E5E5E5] opacity-60 hover:opacity-100'
                  }`}
                >
                  <ResilientImage src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <h2
                id="project-modal-title"
                className="font-serif text-3xl md:text-4xl text-black tracking-tight mb-5"
              >
                {project.title}
              </h2>
              <p className="text-base text-[#222222] leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#E5E5E5] pt-6 lg:pt-0 lg:pl-8">
              <h3 className="text-xs font-mono tracking-wider uppercase text-[#595959] mb-5">
                Architectural Dossier
              </h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between gap-4 pb-3 border-b border-[#F5F5F5]">
                  <dt className="text-[#595959]">Discipline</dt>
                  <dd className="font-medium text-right">{project.category}</dd>
                </div>
                <div className="flex justify-between gap-4 pb-3 border-b border-[#F5F5F5]">
                  <dt className="text-[#595959]">Location</dt>
                  <dd className="font-medium text-right">{project.location}</dd>
                </div>
                <div className="flex justify-between gap-4 pb-3 border-b border-[#F5F5F5]">
                  <dt className="text-[#595959]">Completion</dt>
                  <dd className="font-mono tabular-nums text-right">{project.year}</dd>
                </div>
                {project.area && (
                  <div className="flex justify-between gap-4 pb-3 border-b border-[#F5F5F5]">
                    <dt className="text-[#595959]">Footprint</dt>
                    <dd className="font-mono tabular-nums text-right">{project.area}</dd>
                  </div>
                )}
                {project.client && (
                  <div className="flex justify-between gap-4 pb-3 border-b border-[#F5F5F5]">
                    <dt className="text-[#595959]">Commission</dt>
                    <dd className="font-medium text-right">{project.client}</dd>
                  </div>
                )}
              </dl>

              <button
                type="button"
                onClick={() => onInquireAboutProject(project.title)}
                className="mt-8 w-full py-3.5 px-6 bg-black text-white text-xs font-medium tracking-wider uppercase hover:bg-[#222222] transition-colors cursor-pointer"
              >
                Inquire Similar Commission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
