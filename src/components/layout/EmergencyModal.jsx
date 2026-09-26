import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

/**
 * Simple accessible modal for Emergency Help guidance.
 * Rendered via a portal to `document.body`.
 */
const EmergencyModal = ({ onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
    >
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close emergency help"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 id="emergency-title" className="text-xl font-bold mb-4">
          Emergency Help
        </h2>
        <h3 className="font-semibold mb-2">Immediate Assistance</h3>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Contact your legal/financial advisor.</li>
          <li>Contact the relevant institution for urgent account or claim issues.</li>
          <li>Keep original documents secure.</li>
        </ul>
        <p className="text-sm text-gray-600">
          This is demo guidance, not legal or financial advice.
        </p>
      </div>
    </div>,
    document.body
  );
};

export default EmergencyModal;
