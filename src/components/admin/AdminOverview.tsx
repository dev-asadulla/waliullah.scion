import { ArrowUpRight } from 'lucide-react';
import { computeDashboardMetrics } from '../../lib/portfolioLogic';
import type { AdminCMSState } from '../../lib/portfolioService';

export type AdminTab =
  | 'overview'
  | 'preview'
  | 'projects'
  | 'media'
  | 'philosophy'
  | 'stats'
  | 'inquiries'
  | 'settings';

interface AdminOverviewProps {
  state: AdminCMSState;
  onNavigateTab: (tab: AdminTab) => void;
}

export function AdminOverview({ state, onNavigateTab }: AdminOverviewProps) {
  const metrics = computeDashboardMetrics(state.projects, state.testimonials, state.inquiries);

  const statCards = [
    {
      label: 'Total Projects',
      value: metrics.totalProjects,
      sub: 'Monograph archive',
      tab: 'projects' as AdminTab,
    },
    {
      label: 'Published Projects',
      value: metrics.publishedProjects,
      sub: 'Live on portfolio',
      tab: 'projects' as AdminTab,
    },
    {
      label: 'Draft Projects',
      value: metrics.draftProjects,
      sub: 'Hidden from public',
      tab: 'projects' as AdminTab,
    },
    {
      label: 'Total Testimonials',
      value: metrics.totalTestimonials,
      sub: 'Client endorsements',
      tab: 'stats' as AdminTab,
    },
    {
      label: 'Contact Inquiries',
      value: metrics.totalInquiries,
      sub: `${metrics.unreadInquiries} unread`,
      tab: 'inquiries' as AdminTab,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
            Studio Overview
          </p>
          <h1 className="font-serif text-3xl text-black">Content Management Console</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('preview')}
            className="px-5 py-2.5 border border-[#E5E5E5] bg-white text-black text-xs font-medium uppercase tracking-wider hover:border-black transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Live Preview
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('projects')}
            className="px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#222222] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Manage Projects
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-[#E5E5E5]">
        {statCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onNavigateTab(card.tab)}
            className="text-left bg-white border-r border-b border-[#E5E5E5] p-6 hover:bg-[#F5F5F5] transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#595959] mb-4">
              <span>{card.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="font-mono text-4xl font-medium tabular-nums text-black">
              {card.value}
            </div>
            <div className="text-xs text-[#595959] mt-2">{card.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white border border-[#E5E5E5]">
          <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h2 className="font-serif text-xl text-black">Recent Activities</h2>
            <span className="text-xs font-mono text-[#595959] tabular-nums">
              {state.activities.length} logged
            </span>
          </div>

          {state.activities.length === 0 ? (
            <div className="p-8 text-sm text-[#595959]">
              No CMS edits logged yet. Any project, media, or settings update will appear here.
            </div>
          ) : (
            <ul className="divide-y divide-[#E5E5E5]">
              {state.activities.slice(0, 8).map((act) => (
                <li key={act.id} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-black">{act.action}</div>
                    <div className="text-xs text-[#595959] mt-0.5">{act.summary}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono uppercase text-[#595959]">
                      {act.entityType}
                    </div>
                    {act.createdAt && (
                      <div className="text-[11px] font-mono text-[#808080] tabular-nums mt-0.5">
                        {new Date(act.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5E5E5]">
          <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h2 className="font-serif text-xl text-black">Latest Inquiries</h2>
            <button
              type="button"
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs font-mono uppercase tracking-wider text-black hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {state.inquiries.length === 0 ? (
            <div className="p-8 text-sm text-[#595959]">
              No client inquiries submitted yet. Submissions from the public contact form appear here.
            </div>
          ) : (
            <ul className="divide-y divide-[#E5E5E5]">
              {state.inquiries.slice(0, 5).map((inq) => (
                <li key={inq.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-black">{inq.name}</span>
                    <span className="text-[11px] font-mono uppercase text-[#595959]">
                      {inq.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#595959] mt-0.5">
                    {inq.projectType} {inq.budgetRange ? `· ${inq.budgetRange}` : ''}
                  </div>
                  <p className="text-xs text-[#222222] mt-2 line-clamp-2">{inq.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
