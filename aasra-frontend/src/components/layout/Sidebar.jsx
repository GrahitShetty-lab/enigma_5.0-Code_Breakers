import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, LayoutGrid, ListTodo, FileText, Clock, Settings, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: Home },
  { to: '/assets', label: 'Financial Inventory', icon: LayoutGrid },
  { to: '/actions', label: 'Action Center', icon: ListTodo },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/timeline', label: 'Timeline', icon: Clock },
];

const Sidebar = ({ isMobileOpen = false, onCloseMobile = () => {} }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border p-4 min-h-screen sticky top-0 self-start">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
            Aasra
          </Link>
        </div>
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-textSecondary hover:bg-subtle hover:text-textPrimary'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <NavLink
            to="/setup"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-textSecondary hover:bg-subtle hover:text-textPrimary transition-colors"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Case Intake / Settings</span>
          </NavLink>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Out Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col p-5 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
          <Link
            to="/"
            onClick={onCloseMobile}
            className="text-2xl font-bold text-primary tracking-tight"
          >
            Aasra
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-subtle transition-colors focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-textSecondary hover:bg-subtle hover:text-textPrimary'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <NavLink
            to="/setup"
            onClick={onCloseMobile}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-textSecondary hover:bg-subtle hover:text-textPrimary transition-colors"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Case Intake / Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
