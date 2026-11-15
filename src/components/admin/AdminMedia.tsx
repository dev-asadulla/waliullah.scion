import { Check, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { optimizeImageFile } from '../../lib/imageOptimizer';
import {
  createOrReplaceMediaAsset,
  deleteMediaAssetById,
} from '../../lib/portfolioService';
import type { MediaAsset } from '../../types/portfolio';
import { ResilientImage } from '../portfolio/ResilientImage';
import { ConfirmDeleteDialog, type ToastNotice } from './AdminShared';

interface AdminMediaProps {
  media: MediaAsset[];
  onNotify: (notice: ToastNotice) => void;
}

export function AdminMedia({ media, onNotify }: AdminMediaProps) {
  const [uploading, setUploading] = useState(false);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleUploadNew = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const optimized = await optimizeImageFile(file);
        const baseName = file.name.replace(/\.[^.]+$/, '');
        await createOrReplaceMediaAsset({
          name: baseName,
          url: optimized.dataUrl,
          alt: baseName,
          width: optimized.width,
          height: optimized.height,
          sizeKb: optimized.sizeKb,
          originalSizeKb: optimized.originalSizeKb,
          mimeType: optimized.mimeType,
        });
      }
      onNotify({
        type: 'success',
        message: `${files.length} ${files.length === 1 ? 'image' : 'images'} optimized and saved to media library.`,
      });
    } catch (err) {
      onNotify({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to upload media.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleReplaceAsset = async (asset: MediaAsset, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const optimized = await optimizeImageFile(file);
      await createOrReplaceMediaAsset(
        {
          name: asset.name,
          url: optimized.dataUrl,
          alt: asset.alt,
          width: optimized.width,
          height: optimized.height,
          sizeKb: optimized.sizeKb,
          originalSizeKb: optimized.originalSizeKb,
          mimeType: optimized.mimeType,
        },
        asset.id
      );
      onNotify({
        type: 'success',
        message: `Replaced "${asset.name}" (${optimized.originalSizeKb} KB → ${optimized.sizeKb} KB).`,
      });
    } catch {
      onNotify({ type: 'error', message: 'Failed to replace media asset.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveMeta = async (asset: MediaAsset) => {
    try {
      await createOrReplaceMediaAsset(
        {
          name: nameDraft.trim() || asset.name,
          url: asset.url,
          alt: altDraft.trim(),
          width: asset.width,
          height: asset.height,
          sizeKb: asset.sizeKb,
          originalSizeKb: asset.originalSizeKb,
          mimeType: asset.mimeType,
        },
        asset.id
      );
      setEditingAltId(null);
      onNotify({ type: 'success', message: 'Media metadata updated.' });
    } catch {
      onNotify({ type: 'error', message: 'Failed to update alt text.' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMediaAssetById(deleteTarget);
      onNotify({ type: 'success', message: `Deleted "${deleteTarget.name}".` });
      setDeleteTarget(null);
    } catch {
      onNotify({ type: 'error', message: 'Failed to delete asset.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
            Media &amp; Optimization
          </p>
          <h1 className="font-serif text-3xl text-black">Studio Media Library</h1>
        </div>

        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#222222] transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Optimizing & Uploading...' : 'Upload Images'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={handleUploadNew}
          />
        </label>
      </div>

      {media.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] p-12 text-center text-sm text-[#595959]">
          No media assets uploaded yet. Uploaded photographs are automatically resized and WebP-compressed for fast delivery.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.map((asset) => {
            const isEditing = editingAltId === asset.id;
            return (
              <div key={asset.id} className="bg-white border border-[#E5E5E5] flex flex-col">
                <div className="aspect-[4/3] bg-[#222222] overflow-hidden">
                  <ResilientImage
                    src={asset.url}
                    alt={asset.alt || asset.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        placeholder="Asset title"
                        className="w-full px-3 py-1.5 border border-[#E5E5E5] text-xs focus:outline-none focus:border-black"
                      />
                      <input
                        type="text"
                        value={altDraft}
                        onChange={(e) => setAltDraft(e.target.value)}
                        placeholder="Descriptive alt text"
                        className="w-full px-3 py-1.5 border border-[#E5E5E5] text-xs focus:outline-none focus:border-black"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveMeta(asset)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAltId(null)}
                          className="px-3 py-1.5 border border-[#E5E5E5] text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium text-sm text-black truncate">{asset.name}</h3>
                      <p className="text-xs text-[#595959] mt-1 line-clamp-2">
                        Alt: {asset.alt || 'None set'}
                      </p>
                      <div className="mt-2 text-[11px] font-mono tabular-nums text-[#808080]">
                        {asset.width}×{asset.height} · {asset.sizeKb} KB
                        {asset.originalSizeKb > asset.sizeKb && (
                          <span> (from {asset.originalSizeKb} KB)</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#F5F5F5] flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAltId(asset.id);
                        setNameDraft(asset.name);
                        setAltDraft(asset.alt || '');
                      }}
                      className="px-2.5 py-1.5 border border-[#E5E5E5] hover:border-black transition-colors cursor-pointer"
                    >
                      Edit Alt
                    </button>

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#E5E5E5] hover:border-black transition-colors cursor-pointer">
                        <RefreshCw className="w-3 h-3" />
                        <span>Replace</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleReplaceAsset(asset, e)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(asset)}
                        aria-label={`Delete ${asset.name}`}
                        className="p-1.5 border border-[#E5E5E5] hover:border-black transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Delete Media Asset"
        description={`Delete "${deleteTarget?.name}" from the studio library? Projects already referencing its URL will remain unaffected unless updated.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
