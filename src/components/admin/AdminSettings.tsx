import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { optimizeImageFile, optimizeLogoFile } from '../../lib/imageOptimizer';
import { createOrReplaceMediaAsset, saveSiteSettings } from '../../lib/portfolioService';
import type { MediaAsset, SiteSettings } from '../../types/portfolio';
import { ResilientImage } from '../portfolio/ResilientImage';
import { StudioLogo } from '../portfolio/StudioLogo';
import { MediaPickerModal, type ToastNotice } from './AdminShared';

interface AdminSettingsProps {
  settings: SiteSettings;
  media: MediaAsset[];
  onNotify: (notice: ToastNotice) => void;
}

export function AdminSettings({ settings, media, onNotify }: AdminSettingsProps) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [credentialsText, setCredentialsText] = useState(
    (settings.aboutCredentials || []).join('\n')
  );
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'hero' | 'portrait' | 'logo' | null>(null);

  useEffect(() => {
    setForm(settings);
    setCredentialsText((settings.aboutCredentials || []).join('\n'));
  }, [settings]);

  const handleUploadImage = async (
    target: 'hero' | 'portrait' | 'logo',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (target === 'logo') setUploadingLogo(true);
    try {
      const optimized =
        target === 'logo'
          ? await optimizeLogoFile(file)
          : await optimizeImageFile(file);
      const name = file.name.replace(/\.[^.]+$/, '');
      await createOrReplaceMediaAsset({
        name,
        url: optimized.dataUrl,
        alt: target === 'logo' ? `${form.studioName || 'Studio'} logo` : name,
        width: optimized.width,
        height: optimized.height,
        sizeKb: optimized.sizeKb,
        originalSizeKb: optimized.originalSizeKb,
        mimeType: optimized.mimeType,
      });

      if (target === 'hero') {
        setForm((prev) => ({ ...prev, heroImageUrl: optimized.dataUrl, heroImageAlt: name }));
      } else if (target === 'portrait') {
        setForm((prev) => ({ ...prev, aboutPortraitUrl: optimized.dataUrl, aboutPortraitAlt: name }));
      } else {
        setForm((prev) => ({ ...prev, logoImageUrl: optimized.dataUrl }));
      }
      onNotify({
        type: 'success',
        message:
          target === 'logo'
            ? 'Studio logo uploaded. Click "Save All Settings" to publish live.'
            : 'Image uploaded and applied.',
      });
    } catch (err) {
      onNotify({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Failed to optimize and upload image.',
      });
    } finally {
      if (target === 'logo') setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const credentials = credentialsText
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean)
        .slice(0, 10);

      await saveSiteSettings({
        ...form,
        aboutCredentials: credentials,
      });
      onNotify({ type: 'success', message: 'Website settings published live.' });
    } catch (err) {
      onNotify({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save website settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-1">
            Global Configuration
          </p>
          <h1 className="font-serif text-3xl text-black">Website &amp; SEO Settings</h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#222222] disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving Settings...' : 'Save All Settings'}
        </button>
      </div>

      {/* Identity & Hero */}
      <section className="bg-white border border-[#E5E5E5] p-6 md:p-8 space-y-6">
        <h2 className="font-serif text-2xl text-black border-b border-[#E5E5E5] pb-3">
          Studio Identity &amp; Hero
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">
              Studio / Architect Name
            </label>
            <input
              type="text"
              required
              value={form.studioName}
              onChange={(e) => setForm({ ...form, studioName: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">
              Fallback Monogram Text
            </label>
            <input
              type="text"
              required
              maxLength={24}
              value={form.logoMark}
              onChange={(e) => setForm({ ...form, logoMark: e.target.value })}
              placeholder="VK"
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm font-serif"
            />
          </div>
        </div>

        {/* Studio Logo Upload System */}
        <div className="border border-[#E5E5E5] p-4 md:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-xs font-mono uppercase text-[#595959]">
                Studio Logo Image &amp; Monogram Mark
              </span>
              <span className="block text-xs text-[#808080] mt-0.5">
                Supports SVG, transparent PNG, WebP, or JPG. Falls back to the text monogram when empty.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {form.logoImageUrl && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, logoImageUrl: '' }))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] hover:border-black text-xs text-[#222222] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Logo</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPickerTarget('logo')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] hover:border-black text-xs cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media Library</span>
              </button>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs hover:bg-[#222222] cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingLogo ? 'Processing...' : form.logoImageUrl ? 'Replace Logo' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
                  disabled={uploadingLogo}
                  className="sr-only"
                  onChange={(e) => handleUploadImage('logo', e)}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#F5F5F5] border border-[#E5E5E5] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <StudioLogo
                  studioName={form.studioName || 'Studio'}
                  logoMark={form.logoMark}
                  logoImageUrl={form.logoImageUrl}
                  surface="light"
                  size="lg"
                />
                <div className="min-w-0">
                  <div className="font-serif text-lg text-black truncate">
                    {form.studioName || 'Studio Name'}
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#595959]">
                    Light Header Preview
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black border border-[#222222] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <StudioLogo
                  studioName={form.studioName || 'Studio'}
                  logoMark={form.logoMark}
                  logoImageUrl={form.logoImageUrl}
                  surface="dark"
                  size="lg"
                />
                <div className="min-w-0">
                  <div className="font-serif text-lg text-white truncate">
                    {form.studioName || 'Studio Name'}
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-white/60">
                    Dark Footer Preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">
            Hero Headline
          </label>
          <input
            type="text"
            required
            value={form.heroTitle}
            onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">
            Hero Introductory Statement
          </label>
          <textarea
            rows={2}
            required
            value={form.heroSubtitle}
            onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
          />
        </div>

        <div className="border border-[#E5E5E5] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase text-[#595959]">Hero Background Image</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPickerTarget('hero')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] text-xs cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media Library</span>
              </button>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleUploadImage('hero', e)}
                />
              </label>
            </div>
          </div>
          {form.heroImageUrl && (
            <div className="aspect-[16/9] max-w-sm bg-[#222222] overflow-hidden">
              <ResilientImage src={form.heroImageUrl} alt={form.heroImageAlt} className="w-full h-full object-cover" />
            </div>
          )}
          <input
            type="text"
            value={form.heroImageAlt}
            onChange={(e) => setForm({ ...form, heroImageAlt: e.target.value })}
            placeholder="Hero image alt text"
            className="w-full px-3 py-2 border border-[#E5E5E5] text-xs"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white border border-[#E5E5E5] p-6 md:p-8 space-y-6">
        <h2 className="font-serif text-2xl text-black border-b border-[#E5E5E5] pb-3">
          About / Studio Introduction
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Eyebrow</label>
            <input
              type="text"
              value={form.aboutEyebrow}
              onChange={(e) => setForm({ ...form, aboutEyebrow: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">About Headline</label>
            <input
              type="text"
              required
              value={form.aboutTitle}
              onChange={(e) => setForm({ ...form, aboutTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Professional Introduction</label>
          <textarea
            rows={3}
            required
            value={form.aboutBio}
            onChange={(e) => setForm({ ...form, aboutBio: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Architectural Philosophy</label>
            <textarea
              rows={3}
              value={form.aboutPhilosophy}
              onChange={(e) => setForm({ ...form, aboutPhilosophy: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Design Approach</label>
            <textarea
              rows={3}
              value={form.aboutApproach}
              onChange={(e) => setForm({ ...form, aboutApproach: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Years Experience</label>
            <input
              type="number"
              value={form.aboutExperienceYears}
              onChange={(e) => setForm({ ...form, aboutExperienceYears: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">
              Credentials &amp; Awards (One per line)
            </label>
            <textarea
              rows={3}
              value={credentialsText}
              onChange={(e) => setCredentialsText(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-xs font-mono"
            />
          </div>
        </div>

        <div className="border border-[#E5E5E5] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase text-[#595959]">Architect / Studio Portrait</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPickerTarget('portrait')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] text-xs cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media Library</span>
              </button>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleUploadImage('portrait', e)}
                />
              </label>
            </div>
          </div>
          {form.aboutPortraitUrl && (
            <div className="w-36 aspect-[3/4] bg-[#222222] overflow-hidden">
              <ResilientImage src={form.aboutPortraitUrl} alt={form.aboutPortraitAlt} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* Contact, Social, Navigation & Visibility */}
      <section className="bg-white border border-[#E5E5E5] p-6 md:p-8 space-y-6">
        <h2 className="font-serif text-2xl text-black border-b border-[#E5E5E5] pb-3">
          Contact, Social Links &amp; Footer
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Phone</label>
            <input
              type="text"
              required
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Studio Locations</label>
            <input
              type="text"
              required
              value={form.contactLocation}
              onChange={(e) => setForm({ ...form, contactLocation: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['instagram', 'linkedin', 'archdaily', 'behance'] as const).map((net) => (
            <div key={net}>
              <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">{net}</label>
              <input
                type="url"
                value={form.socialLinks[net] || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, [net]: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-[#E5E5E5] text-xs font-mono"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Footer Description</label>
            <textarea
              rows={2}
              value={form.footerDescription}
              onChange={(e) => setForm({ ...form, footerDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Copyright Text</label>
            <input
              type="text"
              value={form.copyrightText}
              onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
        </div>
      </section>

      {/* Navigation, Section Visibility & SEO */}
      <section className="bg-white border border-[#E5E5E5] p-6 md:p-8 space-y-6">
        <h2 className="font-serif text-2xl text-black border-b border-[#E5E5E5] pb-3">
          Navigation, Section Visibility &amp; SEO
        </h2>

        <div>
          <h3 className="text-xs font-mono uppercase text-[#595959] mb-3">Navigation Labels</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(['home', 'about', 'projects', 'services', 'contact', 'cta'] as const).map((key) => (
              <div key={key}>
                <label className="block text-[11px] font-mono uppercase text-[#808080] mb-1">{key}</label>
                <input
                  type="text"
                  value={form.navLabels[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      navLabels: { ...form.navLabels, [key]: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-mono uppercase text-[#595959] mb-3">Section Visibility</h3>
          <div className="flex flex-wrap gap-5">
            {(['hero', 'about', 'projects', 'philosophy', 'services', 'stats', 'testimonials', 'contact'] as const).map(
              (sec) => (
                <label key={sec} className="inline-flex items-center gap-2 text-xs font-mono uppercase cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sectionVisibility[sec]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sectionVisibility: {
                          ...form.sectionVisibility,
                          [sec]: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <span>{sec}</span>
                </label>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">SEO Title</label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">Favicon URL (Optional)</label>
            <input
              type="text"
              value={form.faviconUrl}
              onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
              placeholder="Leave blank for default VK monogram"
              className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-[#595959] mb-1.5">SEO Meta Description</label>
          <textarea
            rows={2}
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-[#E5E5E5] text-sm"
          />
        </div>
      </section>

      <MediaPickerModal
        open={pickerTarget !== null}
        media={media}
        onClose={() => setPickerTarget(null)}
        onSelect={(asset) => {
          if (pickerTarget === 'hero') {
            setForm((prev) => ({
              ...prev,
              heroImageUrl: asset.url,
              heroImageAlt: asset.alt || asset.name,
            }));
          } else if (pickerTarget === 'portrait') {
            setForm((prev) => ({
              ...prev,
              aboutPortraitUrl: asset.url,
              aboutPortraitAlt: asset.alt || asset.name,
            }));
          } else if (pickerTarget === 'logo') {
            setForm((prev) => ({
              ...prev,
              logoImageUrl: asset.url,
            }));
          }
        }}
      />
    </form>
  );
}
