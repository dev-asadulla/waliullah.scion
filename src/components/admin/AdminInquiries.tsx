import { MailOpen, Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteInquiryById, toggleInquiryReadStatus } from '../../lib/portfolioService';
import type { Inquiry } from '../../types/portfolio';
import { ConfirmDeleteDialog, type ToastNotice } from './AdminShared';

interface AdminInquiriesProps {
  inquiries: Inquiry[];
  onNotify: (notice: ToastNotice) => void;
}

export function AdminInquiries({ inquiries, onNotify }: AdminInquiriesProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(inquiries[0]?.id || null);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = inquiries.filter((item) => (filter === 'all' ? true : item.status === filter));
  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null;

  const handleToggleStatus = async (inquiry: Inquiry) => {
    try {
      await toggleInquiryReadStatus(inquiry);
      onNotify({
        type: 'success',
        message: `Marked inquiry from ${inquiry.name} as ${inquiry.status === 'unread' ? 'read' : 'unread'}.`,
      });
    } catch {
      onNotify({ type: 'error', message: 'Failed to update inquiry status.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteInquiryById(deleteTarget);
      setDeleteTarget(null);
      onNotify({ type: 'success', message: 'Inquiry deleted.' });
    } catch {
      onNotify({ type: 'error', message: 'Failed to delete inquiry.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
            Client Correspondence
          </p>
          <h1 className="font-serif text-3xl text-black">Contact Inquiries</h1>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F5F5F5] border border-[#E5E5E5]">
          {(['all', 'unread', 'read'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider cursor-pointer ${
                filter === tab ? 'bg-black text-white' : 'text-[#595959] hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] p-12 text-center text-sm text-[#595959]">
          No {filter === 'all' ? '' : filter} contact submissions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#E5E5E5] bg-white">
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#E5E5E5] divide-y divide-[#E5E5E5] max-h-[620px] overflow-y-auto">
            {filtered.map((inq) => {
              const isSelected = selected?.id === inq.id;
              return (
                <button
                  key={inq.id}
                  type="button"
                  onClick={() => setSelectedId(inq.id)}
                  className={`w-full text-left p-5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#F5F5F5]' : 'hover:bg-[#F5F5F5]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-sm ${inq.status === 'unread' ? 'font-semibold text-black' : 'font-medium text-[#222222]'}`}>
                      {inq.name}
                    </span>
                    <span className="text-[11px] font-mono uppercase text-[#595959]">
                      {inq.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#595959]">
                    {inq.projectType}
                    {inq.createdAt ? ` · ${new Date(inq.createdAt).toLocaleDateString()}` : ''}
                  </div>
                  <p className="text-xs text-[#595959] mt-2 line-clamp-2">{inq.message}</p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between">
            {selected && (
              <>
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
                    <div>
                      <h2 className="font-serif text-2xl text-black">{selected.name}</h2>
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-sm font-mono text-[#595959] hover:text-black underline underline-offset-4"
                      >
                        {selected.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(selected)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E5E5] text-xs font-mono uppercase hover:border-black cursor-pointer"
                      >
                        {selected.status === 'unread' ? (
                          <>
                            <MailOpen className="w-3.5 h-3.5" />
                            <span>Mark Read</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            <span>Mark Unread</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(selected)}
                        aria-label={`Delete inquiry from ${selected.name}`}
                        className="p-2 border border-[#E5E5E5] hover:border-black cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-[#E5E5E5] text-xs">
                    <div>
                      <dt className="font-mono uppercase text-[#595959]">Discipline</dt>
                      <dd className="text-black font-medium mt-1">{selected.projectType}</dd>
                    </div>
                    <div>
                      <dt className="font-mono uppercase text-[#595959]">Budget Range</dt>
                      <dd className="text-black font-medium mt-1">
                        {selected.budgetRange || 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono uppercase text-[#595959]">Submitted</dt>
                      <dd className="text-black font-mono tabular-nums mt-1">
                        {selected.createdAt
                          ? new Date(selected.createdAt).toLocaleString()
                          : 'Recently'}
                      </dd>
                    </div>
                  </dl>

                  <div className="pt-6">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-3">
                      Project Brief
                    </h3>
                    <p className="text-sm text-[#222222] leading-relaxed whitespace-pre-line">
                      {selected.message}
                    </p>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-[#E5E5E5]">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.projectType} Inquiry`)}`}
                    className="inline-flex items-center px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#222222] transition-colors"
                  >
                    Reply via Email
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Delete Inquiry"
        description={`Permanently delete the correspondence from "${deleteTarget?.name}"?`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
