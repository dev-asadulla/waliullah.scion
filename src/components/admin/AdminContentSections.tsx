import { Edit3, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  deletePhilosophyById,
  deleteServiceById,
  deleteStatById,
  deleteTestimonialById,
  savePhilosophyItem,
  saveServiceItem,
  saveStatItem,
  saveTestimonialItem,
} from '../../lib/portfolioService';
import type {
  MediaAsset,
  PhilosophyItem,
  ServiceItem,
  StatItem,
  Testimonial,
} from '../../types/portfolio';
import { ResilientImage } from '../portfolio/ResilientImage';
import { ConfirmDeleteDialog, MediaPickerModal, type ToastNotice } from './AdminShared';

export function AdminPhilosophyAndServices({
  philosophy,
  services,
  onNotify,
}: {
  philosophy: PhilosophyItem[];
  services: ServiceItem[];
  onNotify: (notice: ToastNotice) => void;
}) {
  const [philEditId, setPhilEditId] = useState<string | null>(null);
  const [philForm, setPhilForm] = useState({ number: '05', title: '', description: '', displayOrder: 1 });
  const [philOpen, setPhilOpen] = useState(false);

  const [srvEditId, setSrvEditId] = useState<string | null>(null);
  const [srvForm, setSrvForm] = useState({
    title: '',
    description: '',
    deliverablesText: '',
    displayOrder: 1,
  });
  const [srvOpen, setSrvOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: 'philosophy'; item: PhilosophyItem }
    | { kind: 'service'; item: ServiceItem }
    | null
  >(null);
  const [busy, setBusy] = useState(false);

  const handleSavePhil = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await savePhilosophyItem(philForm, philEditId || undefined);
      setPhilOpen(false);
      setPhilEditId(null);
      onNotify({ type: 'success', message: 'Design philosophy principle saved.' });
    } catch {
      onNotify({ type: 'error', message: 'Failed to save philosophy item.' });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveService = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const deliverables = srvForm.deliverablesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      await saveServiceItem(
        {
          title: srvForm.title,
          description: srvForm.description,
          deliverables,
          displayOrder: srvForm.displayOrder,
        },
        srvEditId || undefined
      );
      setSrvOpen(false);
      setSrvEditId(null);
      onNotify({ type: 'success', message: 'Service offering saved.' });
    } catch {
      onNotify({ type: 'error', message: 'Failed to save service.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      if (deleteTarget.kind === 'philosophy') {
        await deletePhilosophyById(deleteTarget.item);
      } else {
        await deleteServiceById(deleteTarget.item);
      }
      onNotify({ type: 'success', message: 'Item deleted.' });
      setDeleteTarget(null);
    } catch {
      onNotify({ type: 'error', message: 'Failed to delete item.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Philosophy */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
              Studio Ethos
            </p>
            <h1 className="font-serif text-3xl text-black">Design Philosophy</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setPhilEditId(null);
              setPhilForm({
                number: String(philosophy.length + 1).padStart(2, '0'),
                title: '',
                description: '',
                displayOrder: philosophy.length + 1,
              });
              setPhilOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Principle</span>
          </button>
        </div>

        <div className="bg-white border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
          {philosophy.map((item) => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-baseline gap-6">
                <span className="font-mono text-2xl tabular-nums text-[#808080]">{item.number}</span>
                <div>
                  <h3 className="font-serif text-xl text-black">{item.title}</h3>
                  <p className="text-sm text-[#595959] mt-1 max-w-2xl">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPhilEditId(item.id);
                    setPhilForm({
                      number: item.number,
                      title: item.title,
                      description: item.description,
                      displayOrder: item.displayOrder,
                    });
                    setPhilOpen(true);
                  }}
                  aria-label={`Edit ${item.title}`}
                  className="p-2 border border-[#E5E5E5] hover:border-black cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget({ kind: 'philosophy', item })}
                  aria-label={`Delete ${item.title}`}
                  className="p-2 border border-[#E5E5E5] hover:border-black cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
              Practice Capabilities
            </p>
            <h2 className="font-serif text-3xl text-black">Architectural Services</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSrvEditId(null);
              setSrvForm({
                title: '',
                description: '',
                deliverablesText: '',
                displayOrder: services.length + 1,
              });
              setSrvOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv) => (
            <div key={srv.id} className="bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-xl text-black">{srv.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSrvEditId(srv.id);
                        setSrvForm({
                          title: srv.title,
                          description: srv.description,
                          deliverablesText: (srv.deliverables || []).join('\n'),
                          displayOrder: srv.displayOrder,
                        });
                        setSrvOpen(true);
                      }}
                      aria-label={`Edit ${srv.title}`}
                      className="p-2 border border-[#E5E5E5] hover:border-black cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ kind: 'service', item: srv })}
                      aria-label={`Delete ${srv.title}`}
                      className="p-2 border border-[#E5E5E5] hover:border-black cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#595959] mt-2">{srv.description}</p>
              </div>
              {srv.deliverables?.length > 0 && (
                <div className="pt-3 border-t border-[#F5F5F5] text-xs font-mono text-[#595959]">
                  {srv.deliverables.join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {philOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-5">
              <h3 className="font-serif text-2xl">{philEditId ? 'Edit Principle' : 'New Principle'}</h3>
              <button type="button" onClick={() => setPhilOpen(false)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSavePhil} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Number</label>
                  <input
                    type="text"
                    required
                    value={philForm.number}
                    onChange={(e) => setPhilForm({ ...philForm, number: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] text-sm font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={philForm.title}
                    onChange={(e) => setPhilForm({ ...philForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={philForm.description}
                  onChange={(e) => setPhilForm({ ...philForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setPhilOpen(false)} className="px-4 py-2 border border-[#E5E5E5] text-xs uppercase cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="px-5 py-2 bg-black text-white text-xs uppercase cursor-pointer">
                  {busy ? 'Saving...' : 'Save Principle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {srvOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-5">
              <h3 className="font-serif text-2xl">{srvEditId ? 'Edit Service' : 'New Service'}</h3>
              <button type="button" onClick={() => setSrvOpen(false)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={srvForm.title}
                  onChange={(e) => setSrvForm({ ...srvForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={srvForm.description}
                  onChange={(e) => setSrvForm({ ...srvForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[#595959] mb-1">
                  Deliverables (One per line)
                </label>
                <textarea
                  rows={3}
                  value={srvForm.deliverablesText}
                  onChange={(e) => setSrvForm({ ...srvForm, deliverablesText: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSrvOpen(false)} className="px-4 py-2 border border-[#E5E5E5] text-xs uppercase cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="px-5 py-2 bg-black text-white text-xs uppercase cursor-pointer">
                  {busy ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Confirm Deletion"
        description={`Permanently delete "${deleteTarget?.item.title}"?`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function AdminStatsAndTestimonials({
  stats,
  testimonials,
  media,
  onNotify,
}: {
  stats: StatItem[];
  testimonials: Testimonial[];
  media: MediaAsset[];
  onNotify: (notice: ToastNotice) => void;
}) {
  const [statEditId, setStatEditId] = useState<string | null>(null);
  const [statForm, setStatForm] = useState({ label: '', value: 0, suffix: '', context: '', displayOrder: 1 });
  const [statOpen, setStatOpen] = useState(false);

  const [testEditId, setTestEditId] = useState<string | null>(null);
  const [testForm, setTestForm] = useState({
    clientName: '',
    designation: '',
    quote: '',
    avatarUrl: '',
    projectRef: '',
    displayOrder: 1,
  });
  const [testOpen, setTestOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: 'stat'; id: string; label: string; raw: StatItem }
    | { kind: 'testimonial'; id: string; label: string; raw: Testimonial }
    | null
  >(null);
  const [busy, setBusy] = useState(false);

  const handleSaveStat = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveStatItem(statForm, statEditId || undefined);
      setStatOpen(false);
      setStatEditId(null);
      onNotify({ type: 'success', message: 'Statistic updated.' });
    } catch {
      onNotify({ type: 'error', message: 'Failed to save statistic.' });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveTestimonial = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveTestimonialItem(testForm, testEditId || undefined);
      setTestOpen(false);
      setTestEditId(null);
      onNotify({ type: 'success', message: 'Testimonial saved.' });
    } catch {
      onNotify({ type: 'error', message: 'Failed to save testimonial.' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      if (deleteTarget.kind === 'stat') {
        await deleteStatById(deleteTarget.raw);
      } else {
        await deleteTestimonialById(deleteTarget.raw);
      }
      setDeleteTarget(null);
      onNotify({ type: 'success', message: 'Deleted successfully.' });
    } catch {
      onNotify({ type: 'error', message: 'Failed to delete item.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Statistics */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
              Studio Milestones
            </p>
            <h1 className="font-serif text-3xl text-black">Statistics &amp; Achievements</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatEditId(null);
              setStatForm({
                label: '',
                value: 10,
                suffix: '+',
                context: '',
                displayOrder: stats.length + 1,
              });
              setStatOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Statistic</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((st) => (
            <div key={st.id} className="bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="font-mono text-4xl tabular-nums text-black">
                  {st.value}
                  {st.suffix}
                </div>
                <div className="text-sm font-medium text-black mt-2">{st.label}</div>
                {st.context && <div className="text-xs font-mono text-[#595959] mt-1">{st.context}</div>}
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F5F5F5]">
                <button
                  type="button"
                  onClick={() => {
                    setStatEditId(st.id);
                    setStatForm({
                      label: st.label,
                      value: st.value,
                      suffix: st.suffix || '',
                      context: st.context || '',
                      displayOrder: st.displayOrder,
                    });
                    setStatOpen(true);
                  }}
                  aria-label={`Edit ${st.label}`}
                  className="p-1.5 border border-[#E5E5E5] hover:border-black cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget({ kind: 'stat', id: st.id, label: st.label, raw: st })}
                  aria-label={`Delete ${st.label}`}
                  className="p-1.5 border border-[#E5E5E5] hover:border-black cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
              Client Voices
            </p>
            <h2 className="font-serif text-3xl text-black">Testimonials</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setTestEditId(null);
              setTestForm({
                clientName: '',
                designation: '',
                quote: '',
                avatarUrl: '',
                projectRef: '',
                displayOrder: testimonials.length + 1,
              });
              setTestOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        </div>

        <div className="bg-white border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
          {testimonials.map((t) => (
            <div key={t.id} className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {t.avatarUrl && (
                  <div className="w-12 h-12 bg-[#222222] shrink-0 overflow-hidden">
                    <ResilientImage src={t.avatarUrl} alt={t.clientName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-serif text-lg text-black mb-2">“{t.quote}”</p>
                  <div className="text-xs font-medium text-black">
                    {t.clientName} · <span className="text-[#595959] font-normal">{t.designation}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setTestEditId(t.id);
                    setTestForm({
                      clientName: t.clientName,
                      designation: t.designation,
                      quote: t.quote,
                      avatarUrl: t.avatarUrl || '',
                      projectRef: t.projectRef || '',
                      displayOrder: t.displayOrder,
                    });
                    setTestOpen(true);
                  }}
                  aria-label={`Edit testimonial from ${t.clientName}`}
                  className="p-2 border border-[#E5E5E5] hover:border-black cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({ kind: 'testimonial', id: t.id, label: t.clientName, raw: t })
                  }
                  aria-label={`Delete testimonial from ${t.clientName}`}
                  className="p-2 border border-[#E5E5E5] hover:border-black cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {statOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-5">
              <h3 className="font-serif text-2xl">{statEditId ? 'Edit Statistic' : 'New Statistic'}</h3>
              <button type="button" onClick={() => setStatOpen(false)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveStat} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Label</label>
                <input
                  type="text"
                  required
                  value={statForm.label}
                  onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Numeric Value</label>
                  <input
                    type="number"
                    required
                    value={statForm.value}
                    onChange={(e) => setStatForm({ ...statForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Suffix</label>
                  <input
                    type="text"
                    value={statForm.suffix}
                    onChange={(e) => setStatForm({ ...statForm, suffix: e.target.value })}
                    placeholder="+"
                    className="w-full px-3 py-2 border border-[#E5E5E5] text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Context</label>
                <input
                  type="text"
                  value={statForm.context}
                  onChange={(e) => setStatForm({ ...statForm, context: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setStatOpen(false)} className="px-4 py-2 border border-[#E5E5E5] text-xs uppercase cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="px-5 py-2 bg-black text-white text-xs uppercase cursor-pointer">
                  {busy ? 'Saving...' : 'Save Statistic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {testOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-5">
              <h3 className="font-serif text-2xl">{testEditId ? 'Edit Testimonial' : 'New Testimonial'}</h3>
              <button type="button" onClick={() => setTestOpen(false)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={testForm.clientName}
                    onChange={(e) => setTestForm({ ...testForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={testForm.designation}
                    onChange={(e) => setTestForm({ ...testForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Project Reference</label>
                <input
                  type="text"
                  value={testForm.projectRef}
                  onChange={(e) => setTestForm({ ...testForm, projectRef: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[#595959] mb-1">Testimonial Quote</label>
                <textarea
                  rows={4}
                  required
                  value={testForm.quote}
                  onChange={(e) => setTestForm({ ...testForm, quote: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={testForm.avatarUrl}
                  onChange={(e) => setTestForm({ ...testForm, avatarUrl: e.target.value })}
                  placeholder="Optional portrait URL"
                  className="flex-1 px-3 py-2 border border-[#E5E5E5] text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E5E5] text-xs hover:border-black cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Pick</span>
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setTestOpen(false)} className="px-4 py-2 border border-[#E5E5E5] text-xs uppercase cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="px-5 py-2 bg-black text-white text-xs uppercase cursor-pointer">
                  {busy ? 'Saving...' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        open={pickerOpen}
        media={media}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => setTestForm((prev) => ({ ...prev, avatarUrl: asset.url }))}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Confirm Deletion"
        description={`Remove "${deleteTarget?.label}"? This action cannot be undone.`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
