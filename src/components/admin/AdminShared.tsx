import { AlertCircle, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import type { MediaAsset } from '../../types/portfolio';
import { ResilientImage } from '../portfolio/ResilientImage';

export interface ToastNotice {
  type: 'success' | 'error';
  message: string;
}

export function AdminToast({
  notice,
  onDismiss,
}: {
  notice: ToastNotice | null;
  onDismiss: () => void;
}) {
  if (!notice) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 max-w-md border px-5 py-4 flex items-start gap-3 shadow-sm ${
        notice.type === 'success'
          ? 'bg-black text-white border-black'
          : 'bg-white text-black border-black'
      }`}
    >
      {notice.type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <span className="text-xs leading-relaxed">{notice.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-2 opacity-70 hover:opacity-100 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <div className="bg-white text-black border border-[#E5E5E5] max-w-md w-full p-6 md:p-8">
        <h3 id="confirm-delete-title" className="font-serif text-2xl text-black mb-2">
          {title}
        </h3>
        <p className="text-sm text-[#595959] leading-relaxed mb-8">{description}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2.5 border border-[#E5E5E5] text-xs font-medium uppercase tracking-wider text-black hover:border-black transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#222222] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {busy ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MediaPickerModal({
  open,
  media,
  onSelect,
  onClose,
}: {
  open: boolean;
  media: MediaAsset[];
  onSelect: (asset: MediaAsset) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-picker-title"
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white text-black border border-[#E5E5E5] max-w-4xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <h3 id="media-picker-title" className="font-serif text-xl">
            Select Studio Media Asset
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media selector"
            className="p-2 hover:bg-[#F5F5F5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-[#595959]">
              <ImageIcon className="w-8 h-8 mx-auto mb-3 opacity-40" />
              No uploaded assets yet. Upload images in Media Library first.
            </div>
          ) : (
            media.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group text-left border border-[#E5E5E5] hover:border-black transition-colors cursor-pointer bg-white"
              >
                <div className="aspect-[4/3] bg-[#222222] overflow-hidden">
                  <ResilientImage
                    src={item.url}
                    alt={item.alt || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5">
                  <div className="text-xs font-medium text-black truncate">{item.name}</div>
                  <div className="text-[11px] font-mono text-[#595959] tabular-nums mt-0.5">
                    {item.width}×{item.height} · {item.sizeKb} KB
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
