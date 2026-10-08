import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

const RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Son',
  'Daughter',
  'Parent',
  'Sibling',
  'Legal Heir',
  'Other',
];

const PAN_REGEX = /^([A-Z]{5}[0-9]{4}[A-Z]|XXXXX[0-9]{4}[A-Z])$/;

const Setup = () => {
  const navigate = useNavigate();
  const { caseData, updateCaseData } = useContext(AppContext);

  const [form, setForm] = useState({
    deceasedName: caseData?.deceasedName || '',
    executorName: caseData?.executorName || '',
    dateOfDeath: caseData?.dateOfDeath || '',
    relationship: caseData?.relationship || '',
    pan: caseData?.pan || '',
    accountCount: caseData?.accountCount !== undefined ? String(caseData.accountCount) : '8',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'deceasedName':
        if (!value || value.trim().length < 2) {
          return "Please enter the deceased person's full name (at least 2 letters).";
        }
        return '';
      case 'executorName':
        if (!value || value.trim().length < 2) {
          return "Please enter the executor or claimant's full name (at least 2 letters).";
        }
        return '';
      case 'dateOfDeath': {
        if (!value) {
          return "Please enter a valid date of passing.";
        }
        const selected = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (isNaN(selected.getTime()) || selected > today) {
          return "Please enter a valid date of passing (cannot be in the future).";
        }
        return '';
      }
      case 'relationship':
        if (!value || value.trim() === '') {
          return "Please select your relationship to the deceased.";
        }
        return '';
      case 'pan': {
        const cleaned = (value || '').trim().toUpperCase();
        if (!cleaned || !PAN_REGEX.test(cleaned)) {
          return "Please enter a valid 10-character PAN (e.g. ABCDE1234F or masked XXXXX1234X).";
        }
        return '';
      }
      case 'accountCount': {
        const num = Number(value);
        if (value === '' || isNaN(num) || num < 0 || !Number.isInteger(num)) {
          return "Please enter estimated number of financial accounts (0 or more).";
        }
        return '';
      }
      default:
        return '';
    }
  };

  const validateAll = (values) => {
    const newErrors = {};
    Object.keys(values).forEach((key) => {
      const err = validateField(key, values[key]);
      if (err) newErrors[key] = err;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === 'pan' ? value.toUpperCase().slice(0, 10) : value;

    setForm((prev) => ({ ...prev, [name]: formattedValue }));

    if (touched[name]) {
      const err = validateField(name, formattedValue);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      deceasedName: true,
      executorName: true,
      dateOfDeath: true,
      relationship: true,
      pan: true,
      accountCount: true,
    };
    setTouched(allTouched);

    const newErrors = validateAll(form);
    setErrors(newErrors);

    const hasErrors = Object.keys(newErrors).length > 0;
    // STRICT NAVIGATION BARRIER: Prevent progression if any errors exist
    if (hasErrors || Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
      }
      return;
    }

    // Commit validated case intake data to AppContext
    updateCaseData({
      deceasedName: form.deceasedName.trim(),
      executorName: form.executorName.trim(),
      dateOfDeath: form.dateOfDeath,
      relationship: form.relationship,
      pan: form.pan.trim().toUpperCase(),
      accountCount: parseInt(form.accountCount, 10) || 0,
      caseStatus: 'Active',
    });

    // Navigate to Dashboard only upon successful validation
    navigate('/dashboard');
  };

  return (
    <section className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-border pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary border border-indigo-100 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Case Intake & Intake Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-textPrimary">Create Closure Case</h2>
          <p className="text-sm text-textSecondary mt-1">
            Initialize an estate closure dossier. Your information is stored privately and securely.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Deceased Name */}
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-1.5" htmlFor="deceasedName">
              Full name of deceased person <span className="text-urgent">*</span>
            </label>
            <input
              id="deceasedName"
              name="deceasedName"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={form.deceasedName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                touched.deceasedName && errors.deceasedName
                  ? 'border-urgent bg-red-50/40 text-urgent focus:border-urgent focus:ring-urgent/20'
                  : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/20 text-textPrimary'
              }`}
            />
            {touched.deceasedName && errors.deceasedName && (
              <p className="mt-1.5 text-xs text-urgent font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.deceasedName}</span>
              </p>
            )}
          </div>

          {/* Executor Name */}
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-1.5" htmlFor="executorName">
              Executor / Claimant full name <span className="text-urgent">*</span>
            </label>
            <input
              id="executorName"
              name="executorName"
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={form.executorName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                touched.executorName && errors.executorName
                  ? 'border-urgent bg-red-50/40 text-urgent focus:border-urgent focus:ring-urgent/20'
                  : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/20 text-textPrimary'
              }`}
            />
            {touched.executorName && errors.executorName && (
              <p className="mt-1.5 text-xs text-urgent font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.executorName}</span>
              </p>
            )}
          </div>

          {/* Date of Death & Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-textPrimary mb-1.5" htmlFor="dateOfDeath">
                Date of death / passing <span className="text-urgent">*</span>
              </label>
              <input
                id="dateOfDeath"
                name="dateOfDeath"
                type="date"
                value={form.dateOfDeath}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                  touched.dateOfDeath && errors.dateOfDeath
                    ? 'border-urgent bg-red-50/40 text-urgent focus:border-urgent focus:ring-urgent/20'
                    : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/20 text-textPrimary'
                }`}
              />
              {touched.dateOfDeath && errors.dateOfDeath && (
                <p className="mt-1.5 text-xs text-urgent font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.dateOfDeath}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-textPrimary mb-1.5" htmlFor="relationship">
                Relationship to deceased <span className="text-urgent">*</span>
              </label>
              <select
                id="relationship"
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 bg-white ${
                  touched.relationship && errors.relationship
                    ? 'border-urgent bg-red-50/40 text-urgent focus:border-urgent focus:ring-urgent/20'
                    : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/20 text-textPrimary'
                }`}
              >
                <option value="">Select relationship...</option>
                {RELATIONSHIP_OPTIONS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
              {touched.relationship && errors.relationship && (
                <p className="mt-1.5 text-xs text-urgent font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.relationship}</span>
                </p>
              )}
            </div>
          </div>

          {/* PAN & Account Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-textPrimary mb-1.5" htmlFor="pan">
                PAN (masked or 10-digit) <span className="text-urgent">*</span>
              </label>
              <input
                id="pan"
                name="pan"
                type="text"
                placeholder="XXXXX1234X or ABCDE1234F"
                maxLength={10}
                value={form.pan}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border font-mono transition-colors focus:outline-none focus:ring-2 uppercase ${
                  touched.pan && errors.pan
                    ? 'border-urgent bg-red-50/40 text-urgent focus:border-urgent focus:ring-urgent/20'
                    : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/20 text-textPrimary'
                }`}
              />
              {touched.pan && errors.pan && (
                <p className="mt-1.5 text-xs text-urgent font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.pan}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-textPrimary mb-1.5" htmlFor="accountCount">
                Approx. number of financial accounts <span className="text-urgent">*</span>
              </label>
              <input
                id="accountCount"
                name="accountCount"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 8"
                value={form.accountCount}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                  touched.accountCount && errors.accountCount
                    ? 'border-urgent bg-red-50/40 text-urgent focus:border-urgent focus:ring-urgent/20'
                    : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-primary/20 text-textPrimary'
                }`}
              />
              {touched.accountCount && errors.accountCount && (
                <p className="mt-1.5 text-xs text-urgent font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.accountCount}</span>
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-4">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>Create Closure Case</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-textMuted">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Complies with Indian statutory probate and banking guidelines</span>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Setup;
