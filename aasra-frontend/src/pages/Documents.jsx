import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Download,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Vital Records',
  'Identity & Tax',
  'Banking & Insurance',
  'Retirement',
  'Legal & Court',
];

const Documents = () => {
  const { documentList, addDocument } = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Account Statement');
  const [isUploading, setIsUploading] = useState(false);

  const filteredDocs = documentList.filter((doc) => {
    if (selectedCategory === 'All') return true;
    return doc.category === selectedCategory || doc.documentType === selectedCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return {
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
          label: 'Verified',
        };
      case 'pending':
        return {
          className: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Clock,
          label: 'Verification Pending',
        };
      case 'missing':
      case 'rejected':
        return {
          className: 'bg-red-50 text-urgent border-red-200',
          icon: AlertCircle,
          label: 'Missing Document',
        };
      default:
        return {
          className: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Clock,
          label: status,
        };
    }
  };

  const handleSimulatedUpload = (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    addDocument({
      name: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      documentType: newDocType,
      category: 'Banking & Insurance',
      fileSize: '1.4 MB',
      isRequired: false,
    });

    setNewDocName('');
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Prominent Placeholder Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary tracking-tight">
              Document Vault
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Module Preview / Placeholder
            </span>
          </div>
          <p className="text-sm text-textSecondary mt-1">
            Secure digital repository for death certificates, KYC records, policy bonds, and bank statements.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsUploading(!isUploading)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Upload Drawer / Modal Preview */}
      {isUploading && (
        <form
          onSubmit={handleSimulatedUpload}
          className="bg-white p-5 rounded-xl border border-primary/30 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-semibold text-textPrimary text-sm flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-primary" />
              <span>Simulated Document Upload</span>
            </h3>
            <span className="text-xs text-textMuted">Local state only</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1" htmlFor="docName">
                Document File Name
              </label>
              <input
                id="docName"
                type="text"
                placeholder="e.g. Aadhaar Card - Executor.pdf"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-textPrimary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textPrimary mb-1" htmlFor="docType">
                Document Classification
              </label>
              <select
                id="docType"
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-textPrimary"
              >
                <option value="Death Certificate">Death Certificate</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Policy Bond">Policy Bond</option>
                <option value="Account Statement">Account Statement</option>
                <option value="Legal Heir Certificate">Legal Heir Certificate</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-3 py-1.5 text-xs text-textSecondary hover:bg-subtle rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-primary text-white hover:bg-primary-hover rounded-lg shadow-xs"
            >
              Commit to Vault
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-4 h-4 text-textMuted flex-shrink-0 mr-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white border border-border text-textSecondary hover:bg-subtle hover:text-textPrimary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const badge = getStatusBadge(doc.status);
          const BadgeIcon = badge.icon;
          return (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-xl border border-border shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-textPrimary text-sm leading-snug line-clamp-2">
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-textMuted mt-1">
                    <span>{doc.category}</span>
                    <span>•</span>
                    <span>{doc.fileSize || '1.5 MB'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-textMuted">
                  Uploaded: {doc.date || doc.uploadDate}
                </span>
                <button
                  type="button"
                  aria-label={`Download ${doc.name}`}
                  className="p-1 rounded text-primary hover:bg-primary-light transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-textSecondary">
        <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-textPrimary">DigiLocker Integration Roadmap</p>
          <p className="mt-0.5">
            Automated fetch of digitally signed Death Certificates via DigiLocker and municipal registries will be
            unlocked in the Q4 release. Verified documents currently display local vault credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Documents;
