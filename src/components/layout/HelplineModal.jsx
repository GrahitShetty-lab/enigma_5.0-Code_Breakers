import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Phone } from 'lucide-react';

/**
 * Simple accessible modal for helpline assistance.
 * Rendered via a portal to `document.body`.
 */
const HelplineModal = ({ onClose }) => {
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
      aria-labelledby="helpline-title"
    >
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close helpline dialog"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 id="helpline-title" className="text-xl font-bold mb-4">
          Need Assistance?
        </h2>
        <p className="mb-3 text-gray-700">
          If you don't understand a feature or need help navigating Aasra, you can contact our support helpline.
        </p>
        <div className="space-y-4">
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2 text-primary" />
            <span className="font-medium mr-2">Aasra Support</span>
            <a href="tel:18001234567" className="text-primary hover:underline">
              1800-123-4567
            </a>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2 text-primary" />
            <span className="font-medium mr-2">Family Assistance</span>
            <a href="tel:18009876543" className="text-primary hover:underline">
              1800-987-6543
            </a>
          </div>
        </div>
        {/* Optional close button at bottom for better UX */}
        <div className="mt-6 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HelplineModal;
