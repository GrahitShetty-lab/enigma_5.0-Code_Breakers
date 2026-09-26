import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import PrivacyNotice from './PrivacyNotice';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background text-textPrimary font-sans antialiased">
      {/* Sidebar with Desktop persistent view and Mobile slide-out drawer */}
      <Sidebar isMobileOpen={mobileMenuOpen} onCloseMobile={closeMobileMenu} />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onToggleMobileMenu={toggleMobileMenu} isOpen={mobileMenuOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      <PrivacyNotice />
</div>
    </div>
  );
};

export default Layout;
