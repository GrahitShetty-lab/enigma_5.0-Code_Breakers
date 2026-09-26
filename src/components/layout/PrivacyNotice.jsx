import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'privacyNoticeDismissed';

const PrivacyNotice = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 bg-primary-light text-primary border-t border-border px-4 py-2 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 z-50">
      <span className="text-sm text-center">
        Demo only. Data is stored locally for demonstration purposes and no personal information is transmitted to external services.
      </span>
      <button
        onClick={handleDismiss}
        className="mt-1 sm:mt-0 inline-flex items-center justify-center gap-1 px-3 py-1 text-xs font-medium rounded bg-primary hover:bg-primary-hover text-white transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
};

export default PrivacyNotice;
