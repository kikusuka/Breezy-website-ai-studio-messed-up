export type ActiveTab = 'landing' | 'research' | 'chat' | 'build' | 'canvas' | 'notes' | 'models' | 'history' | 'docs' | 'settings' | 'profile';

export const VALID_TABS: ActiveTab[] = ['landing', 'research', 'chat', 'build', 'canvas', 'notes', 'models', 'history', 'docs', 'settings', 'profile'];

export const parseHash = (): ActiveTab => {
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].toLowerCase() as ActiveTab;
  return VALID_TABS.includes(hash) ? hash : 'landing';
};

type NavItem = { id: ActiveTab; label: string; icon: string };

// Keep the primary workspace short and task-focused. Use distinct, purposeful icons.
export const MAIN_NAV: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: 'forum' },
  { id: 'research', label: 'Research', icon: 'travel_explore' },
  { id: 'history', label: 'History', icon: 'manage_search' },
  { id: 'notes', label: 'Notes', icon: 'edit_note' },
];

export const LAB_NAV: NavItem[] = [
  { id: 'build', label: 'Build', icon: 'terminal' },
  { id: 'canvas', label: 'Canvas', icon: 'dashboard_customize' },
];

export const MORE_IDS: ActiveTab[] = ['history', 'notes', 'build', 'canvas', 'profile'];

export const TITLES: Record<ActiveTab, string> = {
  landing: 'Home',
  research: 'Research',
  chat: 'Chat',
  build: 'Build',
  canvas: 'Canvas',
  notes: 'Notes',
  models: 'Models',
  history: 'History',
  docs: 'Docs',
  settings: 'Settings',
  profile: 'Profile',
};
