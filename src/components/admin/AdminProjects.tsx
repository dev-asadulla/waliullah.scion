import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { optimizeImageFile } from '../../lib/imageOptimizer';
import { slugify } from '../../lib/portfolioLogic';
import {
  createOrReplaceMediaAsset,
  createOrUpdateProject,
  deleteCategoryById,
  deleteProjectById,
  saveCategory,
  toggleProjectPublished,
  updateProjectOrder,
} from '../../lib/portfolioService';
import type { Category, MediaAsset, Project, ProjectGalleryItem } from '../../types/portfolio';
import { ResilientImage } from '../portfolio/ResilientImage';
import { ConfirmDeleteDialog, MediaPickerModal, type ToastNotice } from './AdminShared';

interface AdminProjectsProps {
  projects: Project[];
  categories: Category[];
  media: MediaAsset[];
  onNotify: (notice: ToastNotice) => void;
}

const emptyProjectForm = (defaultCategory: string, nextOrder: number) => ({
  title: '',
  slug: '',
  category: defaultCategory,
  location: '',
  year: String(new Date().getFullYear()),
  summary: '',
  description: '',
  area: '',
  client: '',
  thumbnailUrl: '',
  thumbnailAlt: '',
  gallery: [] as ProjectGalleryItem[],
  published: true,
  featured: false,
  displayOrder: nextOrder,
});

export function AdminProjects({
  projects,
  categories,
  media,
  onNotify,
}: AdminProjectsProps) {
  const defaultCategory = categories[0]?.name || 'Residential Architecture';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'edit' | 'preview'>('edit');
  const [form, setForm] = useState(() => emptyProjectForm(defaultCategory, projects.length + 1));
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const [mediaPickerTarget, setMediaPickerTarget] = useState<'thumbnail' | 'gallery' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [catSaving, setCatSaving] = useState(false);
  const [deleteCatTarget, setDeleteCatTarget] = useState<Category | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setDrawerMode('edit');
    setForm(emptyProjectForm(defaultCategory, projects.length + 1));
    setFormOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingId(project.id);
    setDrawerMode('edit');
    setForm({
      title: project.title,
      slug: project.slug,
      category: project.category,
      location: project.location,
      year: project.year,
      summary: project.summary,
      description: project.description,
      area: project.area || '',
      client: project.client || '',
      thumbnailUrl: project.thumbnailUrl,
      thumbnailAlt: project.thumbnailAlt || '',
      gallery: project.gallery || [],
      published: project.published,
      featured: project.featured,
      displayOrder: project.displayOrder,
    });
    setFormOpen(true);
  };

  const handleDirectUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    target: 'thumbnail' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const optimized = await optimizeImageFile(file);
      const assetName = file.name.replace(/\.[^.]+$/, '');
      await createOrReplaceMediaAsset({
        name: assetName,
        url: optimized.dataUrl,
        alt: assetName,
        width: optimized.width,
        height: optimized.height,
        sizeKb: optimized.sizeKb,
        originalSizeKb: optimized.originalSizeKb,
        mimeType: optimized.mimeType,
      });

      if (target === 'thumbnail') {
        setForm((prev) => ({
          ...prev,
          thumbnailUrl: optimized.dataUrl,
          thumbnailAlt: prev.thumbnailAlt || assetName,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          gallery: [
            ...prev.gallery,
            { url: optimized.dataUrl, alt: assetName, caption: '' },
          ],
        }));
      }
      onNotify({
        type: 'success',
        message: `Image optimized (${optimized.originalSizeKb} KB → ${optimized.sizeKb} KB) and added to studio media.`,
      });
    } catch (err) {
      onNotify({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to upload image.',
      });
    } finally {
      setUploadingThumb(false);
      e.target.value = '';
    }
  };

  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.summary.trim() || !form.thumbnailUrl.trim()) {
      onNotify({
        type: 'error',
        message: 'Title, location, summary, and thumbnail image are required.',
      });
      return;
    }

    setSaving(true);
    try {
      await createOrUpdateProject(
        {
          ...form,
          slug: form.slug.trim() ? slugify(form.slug, 140) : slugify(form.title, 140),
        },
        editingId || undefined
      );
      onNotify({
        type: 'success',
        message: editingId ? 'Project updated successfully.' : 'New project created successfully.',
      });
      setFormOpen(false);
      setEditingId(null);
    } catch (err) {
      onNotify({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save project.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (project: Project) => {
    try {
      await toggleProjectPublished(project);
      onNotify({
        type: 'success',
        message: project.published
          ? `"${project.title}" moved to drafts.`
          : `"${project.title}" is now published.`,
      });
    } catch {
      onNotify({ type: 'error', message: 'Failed to update publish status.' });
    }
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const current = projects[index];
    const swap = projects[targetIndex];
    try {
      await Promise.all([
        updateProjectOrder(current.id, swap.displayOrder),
        updateProjectOrder(swap.id, current.displayOrder),
      ]);
      onNotify({ type: 'success', message: 'Project display order updated.' });
    } catch {
      onNotify({ type: 'error', message: 'Failed to reorder projects.' });
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProjectById(deleteTarget);
      onNotify({ type: 'success', message: `"${deleteTarget.title}" deleted.` });
      setDeleteTarget(null);
    } catch {
      onNotify({ type: 'error', message: 'Failed to delete project.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCatSaving(true);
    try {
      await saveCategory(newCategoryName.trim(), categories.length + 1);
      setNewCategoryName('');
      onNotify({ type: 'success', message: 'Category added.' });
    } catch {
      onNotify({ type: 'error', message: 'Failed to create category.' });
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setDeleting(true);
    try {
      await deleteCategoryById(deleteCatTarget);
      onNotify({ type: 'success', message: `Category "${deleteCatTarget.name}" removed.` });
      setDeleteCatTarget(null);
    } catch {
      onNotify({ type: 'error', message: 'Failed to delete category.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
            Portfolio Archive
          </p>
          <h1 className="font-serif text-3xl text-black">Projects &amp; Categories</h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#222222] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Category Manager */}
      <div className="bg-white border border-[#E5E5E5] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-black">Project Categories</h2>
            <p className="text-xs text-[#595959] mt-0.5">
              Categories appear as filters on the public portfolio and in the inquiry discipline list.
            </p>
          </div>
          <form onSubmit={handleAddCategory} className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name..."
              aria-label="New category name"
              className="px-3.5 py-2 border border-[#E5E5E5] text-xs focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={catSaving || !newCategoryName.trim()}
              className="px-4 py-2 bg-black text-white text-xs font-medium uppercase tracking-wider disabled:opacity-40 cursor-pointer"
            >
              Add
            </button>
          </form>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="inline-flex items-center gap-2 border border-[#E5E5E5] bg-[#F5F5F5] px-3 py-1.5 text-xs text-black"
            >
              <span>{cat.name}</span>
              <button
                type="button"
                onClick={() => setDeleteCatTarget(cat)}
                aria-label={`Delete category ${cat.name}`}
                className="text-[#595959] hover:text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F5F5F5] text-[11px] font-mono uppercase tracking-wider text-[#595959]">
              <th className="py-3.5 px-4">Order</th>
              <th className="py-3.5 px-4">Project</th>
              <th className="py-3.5 px-4">Discipline</th>
              <th className="py-3.5 px-4">Location / Year</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] text-sm">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-6 text-center text-[#595959]">
                  No projects created yet. Click &ldquo;New Project&rdquo; to publish your first work.
                </td>
              </tr>
            ) : (
              projects.map((proj, index) => (
                <tr key={proj.id} className="hover:bg-[#F5F5F5]/60 transition-colors">
                  <td className="py-3 px-4 font-mono tabular-nums text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${proj.title} up`}
                        className="p-1 border border-[#E5E5E5] bg-white disabled:opacity-30 hover:border-black cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(index, 1)}
                        disabled={index === projects.length - 1}
                        aria-label={`Move ${proj.title} down`}
                        className="p-1 border border-[#E5E5E5] bg-white disabled:opacity-30 hover:border-black cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 bg-[#222222] shrink-0 overflow-hidden">
                        <ResilientImage
                          src={proj.thumbnailUrl}
                          alt={proj.thumbnailAlt || proj.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-black">{proj.title}</div>
                        <div className="text-xs font-mono text-[#595959]">/{proj.slug}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-xs text-[#222222]">{proj.category}</td>

                  <td className="py-3 px-4 text-xs text-[#595959]">
                    <div>{proj.location}</div>
                    <div className="font-mono tabular-nums">{proj.year}</div>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(proj)}
                      aria-label={`${proj.published ? 'Unpublish' : 'Publish'} ${proj.title}`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase border cursor-pointer ${
                        proj.published
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-[#595959] border-[#E5E5E5] hover:border-black'
                      }`}
                    >
                      {proj.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{proj.published ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(proj)}
                        aria-label={`Edit ${proj.title}`}
                        className="p-2 border border-[#E5E5E5] hover:border-black transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(proj)}
                        aria-label={`Delete ${proj.title}`}
                        className="p-2 border border-[#E5E5E5] hover:border-black transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Project Drawer Modal */}
      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-editor-title"
          className="fixed inset-0 z-50 bg-black/70 flex justify-end"
        >
          <div className="bg-white text-black w-full max-w-2xl h-full overflow-y-auto border-l border-[#E5E5E5]">
            <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between gap-4">
              <h2 id="project-editor-title" className="font-serif text-2xl">
                {editingId ? 'Edit Architectural Project' : 'New Architectural Project'}
              </h2>
              <div className="flex items-center gap-2">
                <div className="inline-flex border border-[#E5E5E5]" role="group" aria-label="Editor view mode">
                  <button
                    type="button"
                    onClick={() => setDrawerMode('edit')}
                    className={`px-3 py-1.5 text-xs font-mono uppercase cursor-pointer ${
                      drawerMode === 'edit' ? 'bg-black text-white' : 'bg-white text-[#595959] hover:text-black'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerMode('preview')}
                    className={`px-3 py-1.5 text-xs font-mono uppercase cursor-pointer ${
                      drawerMode === 'preview' ? 'bg-black text-white' : 'bg-white text-[#595959] hover:text-black'
                    }`}
                  >
                    Preview
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label="Close project editor"
                  className="p-2 hover:bg-[#F5F5F5] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {drawerMode === 'preview' ? (
              <div className="p-6 space-y-8 bg-[#F5F5F5] min-h-[calc(100%-69px)]">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-3">
                    Masonry Card Preview ({form.published ? 'Published' : 'Draft'})
                  </p>
                  <div className="max-w-sm bg-white border border-[#E5E5E5]">
                    <div className="w-full overflow-hidden bg-[#222222]">
                      <ResilientImage
                        src={form.thumbnailUrl}
                        alt={form.thumbnailAlt || form.title || 'Project preview'}
                        fallbackTitle={form.title || 'Untitled Project'}
                        className="w-full h-auto block object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#595959] mb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{form.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{form.location || 'Location'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{form.year || '2026'}</span>
                        </div>
                        {form.area && <span className="tabular-nums shrink-0">{form.area}</span>}
                      </div>
                      <h3 className="font-serif text-2xl text-black">
                        {form.title || 'Untitled Commission'}
                      </h3>
                      <p className="mt-2.5 text-sm text-[#222222] leading-relaxed">
                        {form.summary || 'Short architectural summary appears here.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5E5] p-6 space-y-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-[#595959]">
                    Dossier Narrative Preview
                  </p>
                  <p className="text-sm text-[#222222] leading-relaxed whitespace-pre-line">
                    {form.description || 'Full architectural description appears in the project modal.'}
                  </p>
                  {form.gallery.length > 0 && (
                    <div className="pt-2 grid grid-cols-2 gap-3">
                      {form.gallery.map((g, idx) => (
                        <div key={idx} className="border border-[#E5E5E5]">
                          <div className="aspect-[4/3] bg-[#222222] overflow-hidden">
                            <ResilientImage src={g.url} alt={g.alt} className="w-full h-full object-cover" />
                          </div>
                          {g.caption && (
                            <p className="p-2 text-xs text-[#595959]">{g.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDrawerMode('edit')}
                    className="px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider cursor-pointer"
                  >
                    Back to Editor
                  </button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSaveProject} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                        slug: editingId ? prev.slug : slugify(e.target.value, 140),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm font-mono focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm bg-white focus:outline-none focus:border-black"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Zurich, Switzerland"
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                    Completion Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm font-mono focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                    Footprint / Area
                  </label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="640 sqm"
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                    Client / Patron
                  </label>
                  <input
                    type="text"
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    placeholder="Private Commission"
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm font-mono focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                  Short Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-1.5">
                  Full Architectural Description *
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm focus:outline-none focus:border-black"
                />
              </div>

              {/* Thumbnail Section */}
              <div className="border border-[#E5E5E5] p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#595959]">
                    Main Thumbnail *
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget('thumbnail')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] text-xs hover:border-black cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Media Library</span>
                    </button>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingThumb ? 'Optimizing...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleDirectUpload(e, 'thumbnail')}
                      />
                    </label>
                  </div>
                </div>

                {form.thumbnailUrl && (
                  <div className="aspect-[16/9] w-full max-w-xs bg-[#222222] overflow-hidden">
                    <ResilientImage
                      src={form.thumbnailUrl}
                      alt={form.thumbnailAlt || form.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                    placeholder="Image URL or upload above"
                    aria-label="Thumbnail URL"
                    className="w-full px-3 py-2 border border-[#E5E5E5] text-xs font-mono focus:outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    value={form.thumbnailAlt}
                    onChange={(e) => setForm({ ...form, thumbnailAlt: e.target.value })}
                    placeholder="Descriptive alt text"
                    aria-label="Thumbnail alt text"
                    className="w-full px-3 py-2 border border-[#E5E5E5] text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Project Gallery */}
              <div className="border border-[#E5E5E5] p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#595959]">
                    Project Gallery ({form.gallery.length}/12)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget('gallery')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] text-xs hover:border-black cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Add from Media</span>
                    </button>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black text-xs cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleDirectUpload(e, 'gallery')}
                      />
                    </label>
                  </div>
                </div>

                {form.gallery.length > 0 && (
                  <div className="space-y-3">
                    {form.gallery.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 border border-[#F5F5F5]">
                        <div className="w-20 h-14 bg-[#222222] shrink-0 overflow-hidden">
                          <ResilientImage src={item.url} alt={item.alt} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={item.alt}
                            onChange={(e) => {
                              const next = [...form.gallery];
                              next[idx] = { ...next[idx], alt: e.target.value };
                              setForm({ ...form, gallery: next });
                            }}
                            placeholder="Alt text"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] text-xs"
                          />
                          <input
                            type="text"
                            value={item.caption}
                            onChange={(e) => {
                              const next = [...form.gallery];
                              next[idx] = { ...next[idx], caption: e.target.value };
                              setForm({ ...form, gallery: next });
                            }}
                            placeholder="Editorial caption"
                            className="w-full px-2.5 py-1.5 border border-[#E5E5E5] text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              gallery: form.gallery.filter((_, i) => i !== idx),
                            })
                          }
                          aria-label="Remove gallery photo"
                          className="p-1.5 text-[#595959] hover:text-black cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 accent-black"
                  />
                  <span>Publish immediately on public portfolio</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-black"
                  />
                  <span>Featured work</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-5 py-2.5 border border-[#E5E5E5] text-xs font-medium uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#222222] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      <MediaPickerModal
        open={mediaPickerTarget !== null}
        media={media}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={(asset) => {
          if (mediaPickerTarget === 'thumbnail') {
            setForm((prev) => ({
              ...prev,
              thumbnailUrl: asset.url,
              thumbnailAlt: asset.alt || asset.name,
            }));
          } else if (mediaPickerTarget === 'gallery') {
            setForm((prev) => ({
              ...prev,
              gallery: [
                ...prev.gallery,
                { url: asset.url, alt: asset.alt || asset.name, caption: '' },
              ],
            }));
          }
        }}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Delete Project"
        description={`Are you sure you want to permanently remove "${deleteTarget?.title}"? This action cannot be undone.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProject}
      />

      <ConfirmDeleteDialog
        open={deleteCatTarget !== null}
        title="Delete Category"
        description={`Remove category "${deleteCatTarget?.name}"? Existing projects assigned to this category will retain their text label until reassigned.`}
        busy={deleting}
        onCancel={() => setDeleteCatTarget(null)}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}
