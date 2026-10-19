import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { BreezyLogo } from '../components/BreezyLogo';
import { ActiveTab, LAB_NAV, MAIN_NAV, TITLES } from '../lib/nav';
import { useModelState } from '../lib/useModelState';
import { userProfileService } from '../services/userProfileService';

declare const __APP_VERSION__: string;
const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '3.0';

export const initialsOf = (name: string) => {
  const v = name.trim();
  return v ? v.split(/\s+/).slice(0, 2).map((x) => x[0]?.toUpperCase() || '').join('') : 'B';
};

interface ShellProps {
  tab: ActiveTab;
  go: (t: ActiveTab) => void;
  backendOnline: boolean;
  endpointName: string;
  children: React.ReactNode;
}

interface SidebarProps {
  tab: ActiveTab;
  go: (t: ActiveTab) => void;
  backendOnline: boolean;
  endpointName: string;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

function useProfile() {
  const [p, setP] = useState(() => userProfileService.getProfile());
  useEffect(() => {
    const on = () => setP(userProfileService.getProfile());
    window.addEventListener('storage', on);
    window.addEventListener('breezy:profile-changed', on);
    return () => {
      window.removeEventListener('storage', on);
      window.removeEventListener('breezy:profile-changed', on);
    };
  }, []);
  return p;
}

function Avatar({ name, photo, size = 'w-8 h-8' }: { name: string; photo?: string; size?: string }) {
  return (
    <span className={`${size} rounded-circle bg-surface-container-high text-primary font-code-sm text-code-sm flex items-center justify-center overflow-hidden shrink-0`}>
      {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : initialsOf(name)}
    </span>
  );
}

function Sidebar({
  tab,
  go,
  backendOnline,
  endpointName,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const profile = useProfile();
  const name = profile.displayName.trim() || 'Guest';
  const role = profile.roleTitle.trim() || 'Profile not set up';

  const handleNavClick = (id: ActiveTab) => {
    go(id);
    setMobileOpen(false);
  };

  const renderExpandedItem = (n: { id: ActiveTab; label: string; icon: string }) => {
    const active = tab === n.id;
    return (
      <a
        key={n.id}
        href={`#${n.id}`}
        onClick={(e) => {
          e.preventDefault();
          handleNavClick(n.id);
        }}
        aria-current={active ? 'page' : undefined}
        className={`relative flex items-center gap-space-md px-space-md py-space-sm rounded-xl transition-colors ${
          active
            ? 'bg-surface-container-high text-primary font-medium'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
        }`}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-circle bg-primary" />}
        <Icon name={n.icon} className="text-[20px]" fill={active} glow={active} />
        <span className="font-body-md text-body-md">{n.label}</span>
      </a>
    );
  };

  const renderCollapsedItem = (n: { id: ActiveTab; label: string; icon: string }) => {
    const active = tab === n.id;
    return (
      <a
        key={n.id}
        href={`#${n.id}`}
        onClick={(e) => {
          e.preventDefault();
          handleNavClick(n.id);
        }}
        aria-current={active ? 'page' : undefined}
        title={n.label}
        className={`relative w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-colors ${
          active
            ? 'bg-surface-container-high text-primary'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
        }`}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-circle bg-primary" />}
        <Icon name={n.icon} className="text-[20px]" fill={active} glow={active} />
      </a>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element (Gemini-inspired calm, matte surface without heavy splatter bleed) */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 flex flex-col justify-between bg-[#13151b] border-r border-[#262830] transition-all duration-200 ease-in-out ${
          // Mobile drawer behavior
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop collapsed vs expanded width
          isCollapsed ? 'md:w-16' : 'md:w-64'
        }`}
      >
        {/* Top Header / Logo Section */}
        <div className="flex flex-col min-h-0 overflow-y-auto">
          {isCollapsed ? (
            <div className="hidden md:flex flex-col items-center py-space-sm gap-space-xs border-b border-[#262830] shrink-0">
              <button
                type="button"
                onClick={() => go('landing')}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors"
                title="Breezy Home"
              >
                <BreezyLogo size={28} />
              </button>
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-10 h-8 flex items-center justify-center rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <Icon name="chevron_right" className="text-[20px]" />
              </button>
            </div>
          ) : (
            <div className="h-16 px-space-md flex items-center justify-between shrink-0 border-b border-[#262830]">
              <a
                href="#landing"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('landing');
                }}
                className="flex items-center gap-space-sm min-w-0"
              >
                <BreezyLogo size={30} />
                <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">Breezy</span>
                <span className="font-code-sm text-code-sm text-primary bg-surface-container-highest px-space-xs py-0.5 rounded">
                  v{VERSION}
                </span>
              </a>

              {/* Desktop Collapse Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="hidden md:flex p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <Icon name="chevron_left" className="text-[20px]" />
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Close navigation"
                aria-label="Close navigation"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          {isCollapsed ? (
            <nav className="hidden md:flex flex-col gap-space-xs py-space-sm px-1" aria-label="Main navigation">
              {MAIN_NAV.map(renderCollapsedItem)}
              <div className="w-8 h-px bg-outline-variant/30 my-space-xs mx-auto shrink-0" />
              {LAB_NAV.map(renderCollapsedItem)}
            </nav>
          ) : (
            <>
              <nav className="px-space-md py-space-sm flex flex-col gap-space-xs" aria-label="Main navigation">
                {MAIN_NAV.map(renderExpandedItem)}
              </nav>

              <div className="px-space-md pt-space-xs pb-space-sm">
                <div className="px-space-md pb-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Laboratories
                </div>
                <nav className="flex flex-col gap-space-xs" aria-label="Laboratories">
                  {LAB_NAV.map(renderExpandedItem)}
                </nav>
              </div>
            </>
          )}
        </div>

        {/* Footer / Status, Help & Profile */}
        <div className="p-space-sm flex flex-col gap-space-sm border-t border-[#262830] shrink-0">
          {/* Small ? Get Help Option (Gemini-inspired) */}
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => handleNavClick('docs')}
              title="Get help"
              aria-label="Get help"
              className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-colors ${
                tab === 'docs'
                  ? 'bg-surface-container-high text-primary font-medium'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="w-5 h-5 rounded-circle border border-outline-variant/60 flex items-center justify-center text-[11px] font-semibold font-mono">
                ?
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavClick('docs')}
              title="Help & Documentation"
              className={`w-full flex items-center gap-space-sm px-space-md py-space-xs rounded-xl transition-colors font-body-sm text-body-sm ${
                tab === 'docs'
                  ? 'bg-surface-container-high text-primary font-medium'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="w-5 h-5 rounded-circle border border-outline-variant/60 flex items-center justify-center text-[11px] font-semibold font-mono shrink-0">
                ?
              </span>
              <span>Get help</span>
            </button>
          )}

          {isCollapsed ? (
            <div className="hidden md:flex flex-col items-center gap-space-sm">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-surface-container font-code-sm"
                title={`Backend: ${endpointName} (${backendOnline ? 'reachable' : 'unreachable'})`}
              >
                <span className={`w-2 h-2 rounded-circle ${backendOnline ? 'bg-tertiary' : 'bg-error'}`} />
              </div>
              <button
                type="button"
                onClick={() => handleNavClick('profile')}
                title={name}
                aria-label="Open profile"
                className="rounded-circle hover:ring-2 hover:ring-primary/40 transition-all"
              >
                <Avatar name={name} photo={profile.photoURL} size="w-8 h-8" />
              </button>
            </div>
          ) : (
            <>
              <div
                className="flex items-center gap-space-sm px-space-md py-space-xs rounded-xl bg-surface-container font-code-sm text-code-sm"
                title={`Backend: ${endpointName}`}
              >
                <span className={`w-1.5 h-1.5 rounded-circle shrink-0 ${backendOnline ? 'bg-tertiary' : 'bg-error'}`} />
                <span className="text-on-surface-variant truncate">
                  {backendOnline ? 'Backend reachable' : 'Backend unreachable'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleNavClick('profile')}
                className="w-full text-left flex items-center gap-space-md p-space-sm bg-surface-container hover:bg-surface-container-high transition-colors rounded-2xl"
              >
                <Avatar name={name} photo={profile.photoURL} />
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="font-label-md text-label-md text-on-surface truncate">{name}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{role}</span>
                </span>
                <Icon name="more_vert" className="text-outline-variant text-[20px]" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function DesktopHeader({ go }: { go: (t: ActiveTab) => void }) {
  const profile = useProfile();
  const model = useModelState();
  const [q, setQ] = useState('');
  const name = profile.displayName.trim() || 'Guest';
  const chip = model.routable
    ? { dot: 'bg-tertiary', text: 'text-tertiary', label: model.label }
    : model.serverGemini
    ? { dot: 'bg-tertiary', text: 'text-tertiary', label: 'Server Gemini' }
    : { dot: 'bg-outline', text: 'text-outline', label: 'No model assigned' };

  return (
    <header className="hidden md:flex shrink-0 h-16 items-center justify-between gap-space-md px-space-lg bg-surface/70 backdrop-blur-xl shadow-[0_1px_0_rgba(61,73,77,0.3)] relative z-40">
      <div className="flex items-center gap-space-sm flex-1 max-w-xl">
        <form
          className="flex-1 min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              sessionStorage.setItem('breezy:history-q', q);
            } catch {
              /* ignore */
            }
            window.dispatchEvent(new Event('breezy:history-q'));
            go('history');
          }}
        >
          <label className="flex items-center gap-space-sm px-space-md py-space-xs bg-surface-container-low text-on-surface-variant focus-within:text-on-surface focus-within:bg-surface-container rounded-full hairline transition-colors">
            <Icon name="search" className="text-[20px] text-outline" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search research history"
              placeholder="Search your research history…"
              className="font-body-sm text-body-sm bg-transparent flex-1 min-w-0 focus:outline-none placeholder:text-on-surface-variant"
            />
            <kbd className="hidden xl:inline font-code-sm text-code-sm text-outline bg-surface-container-high px-1.5 rounded">
              ↵
            </kbd>
          </label>
        </form>
      </div>

      <div className="flex items-center gap-space-md">
        <button
          type="button"
          onClick={() => go('settings')}
          title="Open Settings (Models & Keys)"
          className={`flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors ${chip.text} font-code-sm text-code-sm max-w-[240px]`}
        >
          <span className={`w-1.5 h-1.5 rounded-circle shrink-0 ${chip.dot}`} />
          <span className="truncate">{chip.label}</span>
        </button>
        <button type="button" aria-label="Open profile" title={name} onClick={() => go('profile')}>
          <Avatar name={name} photo={profile.photoURL} />
        </button>
      </div>
    </header>
  );
}

function MobileHeader({
  tab,
  go,
  onOpenSidebar,
}: {
  tab: ActiveTab;
  go: (t: ActiveTab) => void;
  onOpenSidebar: () => void;
}) {
  const profile = useProfile();
  const name = profile.displayName.trim() || 'Guest';

  return (
    <header className="md:hidden shrink-0 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_0_rgba(61,73,77,0.3)] relative z-40">
      <div className="h-14 px-gutter flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open navigation sidebar"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
          >
            <Icon name="menu" className="text-[24px]" />
          </button>
          <button
            type="button"
            onClick={() => go('landing')}
            className="flex items-center gap-space-xs text-left min-h-[44px] min-w-0 truncate"
          >
            <BreezyLogo size={28} />
            <span className="flex flex-col min-w-0 truncate">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">
                Breezy
              </span>
              <span className="font-code-sm text-code-sm text-on-surface-variant leading-none mt-1 truncate">
                {TITLES[tab]}
              </span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            aria-label="Search history"
            type="button"
            onClick={() => go('history')}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="search" className="text-2xl" />
          </button>
          <button
            aria-label="Profile"
            type="button"
            onClick={() => go('profile')}
            className="w-10 h-10 flex items-center justify-center"
          >
            <Avatar name={name} photo={profile.photoURL} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Shell({ tab, go, backendOnline, endpointName, children }: ShellProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('breezy:sidebar-collapsed');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Close mobile drawer on tab navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [tab]);

  // Save sidebar preference
  useEffect(() => {
    try {
      localStorage.setItem('breezy:sidebar-collapsed', JSON.stringify(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar collapse, Esc to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-[100dvh] w-full flex bg-surface text-on-surface overflow-hidden relative splatter">
      <Sidebar
        tab={tab}
        go={go}
        backendOnline={backendOnline}
        endpointName={endpointName}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`flex-1 min-w-0 flex flex-col transition-[padding] duration-200 ease-in-out ${
          isCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <DesktopHeader go={go} />
        <MobileHeader
          tab={tab}
          go={go}
          onOpenSidebar={() => setMobileOpen(true)}
        />

        {!backendOnline && (
          <div
            role="alert"
            className="shrink-0 flex items-center gap-space-sm px-gutter py-space-xs bg-error-container/40 text-on-error-container font-body-sm text-body-sm"
          >
            <Icon name="cloud_off" className="text-[18px]" /> Backend unreachable — research and chat need it. Retrying every 30s.
          </div>
        )}

        <main className="flex-1 min-h-0 overflow-y-auto splatter-soft" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
