import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminCMSState } from '../../lib/portfolioService';

type PreviewViewport = 'desktop' | 'tablet' | 'mobile';

interface AdminPreviewProps {
  state: AdminCMSState;
  onNavigateHome: () => void;
}

const VIEWPORT_WIDTHS: Record<PreviewViewport, string> = {
  desktop: 'w-full',
  tablet: 'w-[768px] max-w-full',
  mobile: 'w-[390px] max-w-full',
};

const SECTION_ANCHORS = [
  { id: 'home', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'services', label: 'Services' },
  { id: 'stats', label: 'Stats' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'contact', label: 'Contact' },
];

export function AdminPreview({ state, onNavigateHome }: AdminPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [viewport, setViewport] = useState<PreviewViewport>('desktop');
  const [includeDrafts, setIncludeDrafts] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [frameReady, setFrameReady] = useState(false);
  const [frameKey, setFrameKey] = useState(0);

  const postPreviewState = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      {
        type: 'STUDIO_PREVIEW_STATE',
        payload: {
          includeDrafts,
          state: {
            settings: state.settings,
            projects: state.projects,
            categories: state.categories,
            philosophy: state.philosophy,
            services: state.services,
            stats: state.stats,
            testimonials: state.testimonials,
            loadedFromFirestore: true,
          },
        },
      },
      window.location.origin
    );
  }, [includeDrafts, state]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'STUDIO_PREVIEW_READY') {
        setFrameReady(true);
        postPreviewState();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postPreviewState]);

  useEffect(() => {
    if (frameReady) {
      postPreviewState();
    }
  }, [frameReady, postPreviewState]);

  const handleJumpSection = (sectionId: string) => {
    setActiveSection(sectionId);
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'STUDIO_PREVIEW_SCROLL', sectionId },
      window.location.origin
    );
  };

  const handleReloadFrame = () => {
    setFrameReady(false);
    setFrameKey((k) => k + 1);
  };

  const draftCount = state.projects.filter((p) => !p.published).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
            Studio Verification
          </p>
          <h1 className="font-serif text-3xl text-black">Live Portfolio Preview</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIncludeDrafts((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono uppercase border cursor-pointer transition-colors ${
              includeDrafts
                ? 'bg-black text-white border-black'
                : 'bg-white text-[#222222] border-[#E5E5E5] hover:border-black'
            }`}
          >
            {includeDrafts ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>
              {includeDrafts
                ? `Drafts Shown (${draftCount})`
                : 'Published Only'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleReloadFrame}
            aria-label="Reload preview"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E5E5] hover:border-black text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#222222] cursor-pointer"
          >
            <span>Open Public Site</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border border-[#E5E5E5] p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" role="group" aria-label="Preview viewport size">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            aria-pressed={viewport === 'desktop'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase border cursor-pointer ${
              viewport === 'desktop'
                ? 'bg-black text-white border-black'
                : 'bg-white text-[#595959] border-[#E5E5E5] hover:border-black'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            aria-pressed={viewport === 'tablet'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase border cursor-pointer ${
              viewport === 'tablet'
                ? 'bg-black text-white border-black'
                : 'bg-white text-[#595959] border-[#E5E5E5] hover:border-black'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet · 768px</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            aria-pressed={viewport === 'mobile'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase border cursor-pointer ${
              viewport === 'mobile'
                ? 'bg-black text-white border-black'
                : 'bg-white text-[#595959] border-[#E5E5E5] hover:border-black'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile · 390px</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-mono uppercase text-[#808080] shrink-0">
            Jump:
          </span>
          <div className="flex items-center gap-1">
            {SECTION_ANCHORS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleJumpSection(sec.id)}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase whitespace-nowrap border cursor-pointer transition-colors ${
                  activeSection === sec.id
                    ? 'border-black text-black bg-[#F5F5F5]'
                    : 'border-transparent text-[#595959] hover:text-black'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Frame Stage */}
      <div className="bg-[#E5E5E5] border border-[#E5E5E5] p-3 md:p-6 flex justify-center overflow-x-auto">
        <div
          className={`${VIEWPORT_WIDTHS[viewport]} bg-white border border-black/20 shadow-sm transition-all duration-200 overflow-hidden`}
        >
          <iframe
            key={frameKey}
            ref={iframeRef}
            src="/?adminPreview=1"
            title="Live Portfolio Preview"
            onLoad={() => {
              setFrameReady(true);
              postPreviewState();
            }}
            className="w-full h-[72vh] min-h-[580px] border-0 block bg-white"
          />
        </div>
      </div>
    </div>
  );
}
