import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Topbar = ({ onToggleMobileMenu = () => {}, isOpen = false }) => (
  <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-border px-4 py-3 shadow-xs">
    <div className="flex items-center gap-3">
      {/* Mobile Hamburger Menu Toggle Button */}
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        onClick={onToggleMobileMenu}
        className="md:hidden p-2 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-xl font-bold text-primary tracking-tight">Aasra</span>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-light text-primary border border-indigo-100">
          Digital Estate Closure
        </span>
      </Link>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      >
        <Bell className="w-5 h-5 text-textSecondary" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
      </button>
    </div>
  </header>
);

export default Topbar;
