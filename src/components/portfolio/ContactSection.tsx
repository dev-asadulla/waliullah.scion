import { CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { validateContactForm } from '../../lib/portfolioLogic';
import { submitPublicInquiry } from '../../lib/portfolioService';
import type { Category, ContactFormInput, SiteSettings } from '../../types/portfolio';

interface ContactSectionProps {
  settings: SiteSettings;
  categories: Category[];
  preselectedProjectType?: string;
}

const BUDGET_RANGES = [
  'Undisclosed / Advisory',
  '$250k – $750k',
  '$750k – $2M',
  '$2M – $5M',
  '$5M+',
];

export function ContactSection({
  settings,
  categories,
  preselectedProjectType,
}: ContactSectionProps) {
  const projectTypes = categories.length > 0
    ? categories.map((c) => c.name)
    : ['Residential Architecture', 'Commercial Architecture', 'Interior Design', 'Consultation'];

  const [form, setForm] = useState<ContactFormInput>({
    name: '',
    email: '',
    projectType: preselectedProjectType || projectTypes[0] || 'Residential Architecture',
    budgetRange: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    if (preselectedProjectType) {
      setForm((prev) => ({ ...prev, projectType: preselectedProjectType }));
    }
  }, [preselectedProjectType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitState('idle');
    setSubmitMessage('');

    const validationErrors = validateContactForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await submitPublicInquiry(form);
      setSubmitState('success');
      setSubmitMessage(
        'Thank you. Your architectural brief has been logged with our partners—we respond within two business days.'
      );
      setForm({
        name: '',
        email: '',
        projectType: projectTypes[0] || 'Residential Architecture',
        budgetRange: '',
        message: '',
      });
    } catch {
      setSubmitState('error');
      setSubmitMessage(
        `We could not submit your inquiry at this moment. Please reach us directly at ${settings.contactEmail}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const socialItems = [
    { label: 'Instagram', url: settings.socialLinks.instagram },
    { label: 'LinkedIn', url: settings.socialLinks.linkedin },
    { label: 'ArchDaily', url: settings.socialLinks.archdaily },
    { label: 'Behance', url: settings.socialLinks.behance },
  ].filter((item) => item.url && item.url.trim().length > 0);

  return (
    <section id="contact" className="bg-[#F5F5F5] text-black py-24 md:py-36">
      <div className="max-w-[1380px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#595959] mb-4">
                New Commissions
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.06] tracking-tight text-black [text-wrap:balance] mb-6">
                Have a Project in Mind?
              </h2>
              <p className="text-base text-[#222222] leading-relaxed max-w-md mb-12">
                We accept a select number of residential, cultural, and interior commissions each year across Europe, North America, and Japan.
              </p>
            </div>

            <div className="space-y-8 border-t border-[#E5E5E5] pt-8">
              <div>
                <h3 className="text-xs font-mono tracking-wider uppercase text-[#595959] mb-1.5">
                  Direct Correspondence
                </h3>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-lg font-medium text-black hover:underline underline-offset-4"
                >
                  {settings.contactEmail}
                </a>
              </div>

              <div>
                <h3 className="text-xs font-mono tracking-wider uppercase text-[#595959] mb-1.5">
                  Telephone
                </h3>
                <a
                  href={`tel:${settings.contactPhone.replace(/[^+\d]/g, '')}`}
                  className="text-base font-mono tabular-nums text-black hover:underline underline-offset-4"
                >
                  {settings.contactPhone}
                </a>
              </div>

              <div>
                <h3 className="text-xs font-mono tracking-wider uppercase text-[#595959] mb-1.5">
                  Studios
                </h3>
                <p className="text-sm text-[#222222]">{settings.contactLocation}</p>
              </div>

              {socialItems.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono tracking-wider uppercase text-[#595959] mb-3">
                    Channels
                  </h3>
                  <div className="flex flex-wrap gap-5">
                    {socialItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-black hover:opacity-65 transition-opacity"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#E5E5E5] p-8 md:p-12">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-2">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Clara Lindqvist"
                    className="w-full px-4 py-3 bg-white border border-[#E5E5E5] text-sm text-black placeholder:text-[#808080] focus:outline-none focus:border-black transition-colors"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-black font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-2">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="clara@domain.com"
                    className="w-full px-4 py-3 bg-white border border-[#E5E5E5] text-sm text-black placeholder:text-[#808080] focus:outline-none focus:border-black transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-black font-medium">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-type" className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-2">
                    Project Discipline *
                  </label>
                  <select
                    id="contact-type"
                    name="projectType"
                    value={form.projectType}
                    onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-[#E5E5E5] text-sm text-black focus:outline-none focus:border-black transition-colors"
                  >
                    {projectTypes.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                    <option value="Architectural Consultation">Architectural Consultation</option>
                  </select>
                  {errors.projectType && (
                    <p className="mt-1.5 text-xs text-black font-medium">{errors.projectType}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-budget" className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-2">
                    Estimated Budget (Optional)
                  </label>
                  <select
                    id="contact-budget"
                    name="budgetRange"
                    value={form.budgetRange}
                    onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-[#E5E5E5] text-sm text-black focus:outline-none focus:border-black transition-colors"
                  >
                    <option value="">Select range</option>
                    {BUDGET_RANGES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-2">
                  Site, Timeline &amp; Brief *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Share site location, approximate scale, and target schedule..."
                  className="w-full px-4 py-3 bg-white border border-[#E5E5E5] text-sm text-black placeholder:text-[#808080] focus:outline-none focus:border-black transition-colors resize-y"
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-black font-medium">{errors.message}</p>
                )}
              </div>

              {submitState === 'success' && (
                <div
                  role="status"
                  className="p-4 bg-[#F5F5F5] border border-black flex items-start gap-3 text-sm text-black"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{submitMessage}</span>
                </div>
              )}

              {submitState === 'error' && (
                <div
                  role="alert"
                  className="p-4 bg-[#F5F5F5] border border-black flex items-start gap-3 text-sm text-black"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{submitMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-4 bg-black text-white text-xs font-medium tracking-wider uppercase hover:bg-[#222222] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
