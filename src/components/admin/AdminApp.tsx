import type { User } from '@supabase/supabase-js';
import {
  ArrowLeft,
  BarChart3,
  Compass,
  Eye,
  FolderKanban,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import {
  subscribeAdminCMS,
  type AdminCMSState,
} from '../../lib/portfolioService';
import {
  AdminPhilosophyAndServices,
  AdminStatsAndTestimonials,
} from './AdminContentSections';
import { AdminInquiries } from './AdminInquiries';
import { AdminMedia } from './AdminMedia';
import { AdminOverview, type AdminTab } from './AdminOverview';
import { AdminPreview } from './AdminPreview';
import { AdminProjects } from './AdminProjects';
import { AdminSettings } from './AdminSettings';
import { AdminToast, type ToastNotice } from './AdminShared';
import { StudioLogo } from '../portfolio/StudioLogo';

interface AdminAppProps {
  onNavigateHome: () => void;
}

export function AdminApp({ onNavigateHome }: AdminAppProps) {
  // Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminCheckReady, setAdminCheckReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Dashboard states
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cmsState, setCmsState] = useState<AdminCMSState | null>(null);
  const [notice, setNotice] = useState<ToastNotice | null>(null);

  // Supabase authentication listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Verify administrator privileges
  useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminCheckReady(true);
        setAuthError('');
        return;
      }

      setAdminCheckReady(false);

      try {
        const { data, error } = await supabase.rpc('is_admin');

        if (!active) return;

        if (error) {
          console.error('Admin verification failed:', error);
          setAuthError('Unable to verify administrator privileges.');
          setIsAdmin(false);
        } else {
          setAuthError('');
          setIsAdmin(data === true);
        }
      } catch (err) {
        if (!active) return;

        console.error('Admin verification failed:', err);
        setAuthError('Unable to verify administrator privileges.');
        setIsAdmin(false);
      } finally {
        if (active) {
          setAdminCheckReady(true);
        }
      }
    };

    void verifyAdmin();

    return () => {
      active = false;
    };
  }, [user]);

  // Subscribe to dashboard data
  useEffect(() => {
    if (!user || !isAdmin) {
      setCmsState(null);
      return;
    }

    const unsub = subscribeAdminCMS(
      (nextState) => setCmsState(nextState),
      (err) => {
        setNotice({ type: 'error', message: err.message });
      }
    );

    return () => unsub();
  }, [user, isAdmin]);

  // Notice auto-dismiss timer
  useEffect(() => {
    if (!notice) return;

    const t = setTimeout(() => setNotice(null), 4500);

    return () => clearTimeout(t);
  }, [notice]);

  // Supabase email/password sign in
  const handleEmailSignIn = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setAuthError('');
    setSigningIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      setPassword('');
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Unable to complete sign-in.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  // Supabase sign out
  const handleSignOut = async () => {
    setAuthError('');

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
      return;
    }

    setCmsState(null);
    setIsAdmin(false);
  };
    // Initial authentication loading
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-black flex items-center justify-center p-6">
        <div className="text-xs font-mono uppercase tracking-widest text-[#595959]">
          Verifying Studio Session...
        </div>
      </div>
    );
  }

  // Admin permission verification loading
  if (user && !adminCheckReady) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-black flex items-center justify-center p-6">
        <div className="text-xs font-mono uppercase tracking-widest text-[#595959]">
          Verifying Administrator Access...
        </div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-black flex flex-col justify-between p-6 md:p-12">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <StudioLogo
              studioName="Voss & Kerr"
              logoMark="VK"
              surface="light"
              size="sm"
            />
            <span className="font-serif text-xl">Voss &amp; Kerr</span>
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#595959] hover:text-black"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portfolio</span>
          </a>
        </div>

        <div className="max-w-md w-full mx-auto bg-white border border-[#E5E5E5] p-8 md:p-10">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#595959] mb-3">
            Protected Route
          </p>

          <h1 className="font-serif text-3xl text-black mb-3">
            Studio CMS Sign In
          </h1>

          <p className="text-sm text-[#595959] leading-relaxed mb-8">
            Sign in with your authorized studio administrator email and
            password to manage architectural projects, media assets,
            statistics, and client inquiries.
          </p>

          {authError && (
            <div
              role="alert"
              className="mb-6 p-3.5 bg-[#F5F5F5] border border-black text-xs text-black"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-2"
              >
                Email Address
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                required
                className="w-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-mono uppercase tracking-wider text-[#595959] mb-2"
              >
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full py-3.5 px-6 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#222222] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {signingIn ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="text-xs font-mono text-[#808080] text-center">
          Monograph Content Management System
        </div>
      </div>
    );
  }

  // Access restricted screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] p-8">
          <p className="text-xs font-mono uppercase tracking-wider text-[#595959] mb-2">
            Access Restricted
          </p>

          <h1 className="font-serif text-2xl text-black mb-3">
            Administrator Privileges Required
          </h1>

          <p className="text-sm text-[#595959] leading-relaxed mb-6">
            Signed in as{' '}
            <span className="font-mono text-black">{user.email}</span>.
            This account is not listed as a studio administrator.
          </p>

          {authError && (
            <div
              role="alert"
              className="mb-6 p-3.5 bg-[#F5F5F5] border border-black text-xs text-black"
            >
              {authError}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-5 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider cursor-pointer"
            >
              Sign Out
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="px-5 py-2.5 border border-[#E5E5E5] text-xs font-medium uppercase tracking-wider cursor-pointer"
            >
              Return to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount =
    cmsState?.inquiries.filter((i) => i.status === 'unread').length || 0;

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'preview', label: 'Live Preview', icon: Eye },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'philosophy', label: 'Philosophy & Services', icon: Compass },
    { id: 'stats', label: 'Stats & Testimonials', icon: BarChart3 },
    { id: 'inquiries', label: 'Inquiries', icon: Inbox, badge: unreadCount },
    { id: 'settings', label: 'Website Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
        <div className="min-h-screen bg-[#F5F5F5] text-black flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-black text-white flex-col justify-between shrink-0 border-r border-[#222222]">
        <div>
          <div className="p-6 border-b border-[#222222] flex items-center gap-3">
            <StudioLogo
              studioName={cmsState?.settings.studioName || 'Voss & Kerr'}
              logoMark={cmsState?.settings.logoMark}
              logoImageUrl={cmsState?.settings.logoImageUrl}
              surface="dark"
              size="md"
            />

            <div className="min-w-0">
              <div className="font-serif text-xl text-white truncate">
                {cmsState?.settings.studioName || 'Voss & Kerr'}
              </div>

              <div className="text-[11px] font-mono uppercase tracking-wider text-white/50 mt-0.5">
                Studio CMS
              </div>
            </div>
          </div>

          <nav
            aria-label="Admin sidebar navigation"
            className="p-4 space-y-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                    active
                      ? 'bg-white text-black'
                      : 'text-white/75 hover:text-white hover:bg-[#222222]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>

                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="font-mono text-[11px] tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#222222] space-y-3">
          <div className="px-2 text-xs font-mono text-white/60 truncate">
            {user.email}
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 border border-[#222222] text-xs text-white/80 hover:text-white hover:border-white/40 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </a>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-white/70 hover:text-white cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-black text-white px-4 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="inline-flex items-center gap-2.5">
          <StudioLogo
            studioName={cmsState?.settings.studioName || 'Voss & Kerr'}
            logoMark={cmsState?.settings.logoMark}
            logoImageUrl={cmsState?.settings.logoImageUrl}
            surface="dark"
            size="sm"
          />

          <span className="font-serif text-lg">Studio CMS</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle admin menu"
          className="p-2"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black text-white border-t border-[#222222] p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full text-left px-3 py-2.5 text-xs font-medium ${
                activeTab === item.id
                  ? 'bg-white text-black'
                  : 'text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-[#222222] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-white/80 py-2"
            >
              View Public Site
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="text-white/70 py-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-7xl w-full mx-auto">
                {!cmsState ? (
          <div className="py-24 text-center text-xs font-mono uppercase tracking-widest text-[#595959]">
            Synchronizing Studio Database...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <AdminOverview
                state={cmsState}
                onNavigateTab={handleSelectTab}
              />
            )}

            {activeTab === 'preview' && (
              <AdminPreview
                state={cmsState}
                onNavigateHome={onNavigateHome}
              />
            )}

            {activeTab === 'projects' && (
              <AdminProjects
                projects={cmsState.projects}
                categories={cmsState.categories}
                media={cmsState.media}
                onNotify={setNotice}
              />
            )}

            {activeTab === 'media' && (
              <AdminMedia
                media={cmsState.media}
                onNotify={setNotice}
              />
            )}

            {activeTab === 'philosophy' && (
              <AdminPhilosophyAndServices
                philosophy={cmsState.philosophy}
                services={cmsState.services}
                onNotify={setNotice}
              />
            )}

            {activeTab === 'stats' && (
              <AdminStatsAndTestimonials
                stats={cmsState.stats}
                testimonials={cmsState.testimonials}
                media={cmsState.media}
                onNotify={setNotice}
              />
            )}

            {activeTab === 'inquiries' && (
              <AdminInquiries
                inquiries={cmsState.inquiries}
                onNotify={setNotice}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettings
                settings={cmsState.settings}
                media={cmsState.media}
                onNotify={setNotice}
              />
            )}
          </>
        )}
      </main>

      <AdminToast
        notice={notice}
        onDismiss={() => setNotice(null)}
      />
    </div>
  );
}
