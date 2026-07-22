import {
  Bell,
  ClipboardList,
  Gauge,
  LayoutGrid,
  ListTree,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/artisans', label: 'Artisans', icon: Wrench },
  { to: '/categories', label: 'Categories', icon: ListTree },
  { to: '/service-requests', label: 'Service Requests', icon: ClipboardList },
  { to: '/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/statistics', label: 'Statistics', icon: Gauge },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ title, searchPlaceholder = 'Search for users, artisans, or requests...', onSearch, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-surface font-sans text-on-surface">
      <aside className="fixed inset-y-0 left-0 flex w-sidebar flex-col border-r border-outline-variant bg-surface-container-lowest">
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-on-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="font-headline text-lg font-bold leading-tight text-primary">FasoConnect</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md border-l-4 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-outline-variant px-3 py-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-error"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col pl-sidebar">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-outline-variant bg-surface-container-lowest px-6 py-3">
          <label className="relative flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              onChange={(event) => onSearch?.(event.target.value)}
              className="w-full rounded-md border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="flex flex-1" />
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-low">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 border-l border-outline-variant pl-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container">
              {(user?.fullName || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user?.fullName || 'Admin'}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{user?.role === 'ADMIN' ? 'Super Admin' : user?.role}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">
          {title && (
            <div className="mb-6">
              <h1 className="font-headline text-4xl font-bold tracking-tight">{title}</h1>
            </div>
          )}
          {children}
        </main>

        <footer className="border-t border-outline-variant bg-surface-container-lowest px-8 py-4">
          <div className="flex flex-col items-center justify-between gap-2 text-sm text-on-surface-variant sm:flex-row">
            <p>&copy; {new Date().getFullYear()} FasoConnect. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="cursor-default hover:text-primary">Privacy Policy</span>
              <span className="cursor-default hover:text-primary">Terms of Service</span>
              <span className="cursor-default hover:text-primary">Contact Support</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
