# Survey Report: Data Models, Mock Data & State Architecture
**Project**: Aasra Digital Estate Closure Assistant  
**Author**: Explorer 2 (Survey & Data Architecture)  
**Date**: 2026-09-26  
**Status**: Completed  
**Target File**: `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_2\survey_data_state.md`

---

## 1. Executive Summary

Aasra is a digital estate closure assistant tailored for the Indian financial and legal ecosystem, helping grieving families and executors systematically inventory assets, track liabilities, fulfill statutory claims (insurance, EPF/PPF, bank accounts), and maintain an audit trail.

This investigation evaluated the current mock data (`src/data/mockData.js`), state management (`src/context/AppContext.jsx`), and data flows across all 7 routes specified in **R1** of the authoritative requirements (`ORIGINAL_REQUEST.md`).

### Key Discoveries & Critical Gaps:
1. **Disconnected Setup Form**: `src/pages/Setup.jsx` captures intake form fields (`deceasedName`, `dateOfDeath`, `relationship`, `pan`, `accountCount`) but does **not** write to `AppContext`. On submit, it calls `navigate('/dashboard')` without committing user data, leaving the dashboard with static mock data.
2. **Missing Routes & Placeholders in Navigation**: While `ORIGINAL_REQUEST.md` mandates 7 routes (Landing, Setup, Dashboard, Financial Inventory, Action Center, Documents, Timeline), `src/App.jsx` currently only registers `/`, `/setup`, and `/dashboard`. Routes for `/assets`, `/actions`, `/documents`, and `/timeline` are omitted and fall back to the redirect wildcard (`/`).
3. **Sidebar Navigation Disconnect & Template Bug**:
   - In `src/components/layout/Sidebar.jsx`, the item `'Overview'` points to `/` (Landing page) rather than `/dashboard` (the operational case overview).
   - Line 23 of `Sidebar.jsx` contains a string concatenation bug inside a template literal: `` `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 " + (isActive ? 'bg-gray-100 font-medium' : '')` ``, which renders verbatim code syntax into the DOM class attribute.
4. **Flawed Progress Calculation**: In `src/pages/Dashboard.jsx`, closure progress is computed as `((totalAssets - totalLiabilities) / totalAssets) * 100`, which measures net worth equity ratio rather than actual task/claim closure completion. It must be refactored to track completed actions/milestones (e.g., `(completedActions / totalActions) * 100`).
5. **Chart Data Categorization**: Dashboard's Recharts Pie Chart currently maps slices by institution name rather than by asset class/category. Multiple holdings under the same institution or non-standard category groupings cause duplicate keys and suboptimal financial visualization.
6. **State Persistence Deficiency**: `AppContext.jsx` currently stores state in transient React `useState` hooks with no `localStorage` synchronization. Refreshing the browser or navigating back to setup resets any user changes.

---

## 2. Current State Assessment

### 2.1 Analysis of `src/data/mockData.js`
The current mock data file contains 5 exported collections:
- `caseInfo` (1 object): Contains basic identifiers (`id`, `deceasedName`, `dateOfDeath`, `relationship`, `pan`, `accountCount`). Lacks executor details, status, contact info, death certificate status, and case timestamps.
- `assets` (5 items):
  - HDFC Bank (Bank Account) — ₹2,40,000 ("Review Required")
  - LIC (Life Insurance) — ₹5,00,000 ("Claim Not Started")
  - EPFO (EPF) — ₹3,80,000 ("Nominee Verification")
  - Home Loan Co (Liability) — ₹1,20,000 ("Active")
  - Netflix (Subscription) — ₹649/mo ("Cancellation Required")
  *Gaps*: Missing key Indian asset classes: Mutual Funds / Demat / Stocks, Fixed Deposits, PPF, Real Estate / Physical Property. Also lacks account/policy numbers (masked), nominee names, contact branch, and claim submission details.
- `actions` (4 items):
  - Submit insurance claim (LIC, high, due: 2026-09-30, status: "needs")
  - Verify EPF nominee (EPFO, medium, due: 2026-10-05, status: "needs")
  - Review home-loan liability (Home Loan Co, medium, due: 2026-10-10, status: "needs")
  - Cancel Netflix subscription (Netflix, low, due: 2026-09-20, status: "needs")
  *Gaps*: All 4 have status `"needs"`. There are no `"completed"`, `"in-progress"`, or `"urgent"` tasks to demonstrate dynamic filtering, progress changes, or task completion workflows.
- `documents` (5 items):
  - Death Certificate.pdf, PAN Card.pdf, LIC Policy.pdf, EPF Statement.pdf, Bank Statement.pdf.
  - *Gaps*: No file sizes, verification status flags (`"verified"`, `"pending"`, `"missing"`), download/preview metadata, or linkage to specific assets/claims.
- `timeline` (6 items):
  - Case Created, Financial Accounts Identified, Documents Collected, Claims Initiated, Liabilities Reviewed, Financial Closure Completed.
  - *Gaps*: Lacks detailed narrative descriptions, event category tags, responsible actors/institutions, and icon identifiers.

### 2.2 Analysis of `src/context/AppContext.jsx`
- Currently exposes:
  ```javascript
  const [caseData, setCaseData] = useState(caseInfo);
  const [assetList, setAssetList] = useState(assets);
  const [actionList, setActionList] = useState(actions);
  const [documentList, setDocumentList] = useState(documents);
  const [timelineList, setTimelineList] = useState(timeline);
  ```
- Mutation functions provided:
  - `updateActionStatus(id, status)`
  - `updateAssetStatus(id, status)`
- Deficiencies:
  - No `updateCaseData` function to allow `Setup.jsx` to update profile state.
  - No `toggleAction(id)` helper to quickly toggle between completed and pending.
  - No `addAsset(newAsset)` or `addDocument(newDoc)` to support inventory expansion.
  - No derived metrics exposed directly (Dashboard recomputes everything inline).
  - No `localStorage` persistence layer.

---

## 3. Route-by-Route Data & Interaction Specifications (R1)

| Route | Page Component | Data Inputs / Context Consumed | User Interactions & Mutations | Output / Rendered UI |
|---|---|---|---|---|
| `/` | `Landing.jsx` | Static marketing copy, case overview highlights | "Start a Closure Case" (CTA to `/setup`), "View Live Demo" (CTA to `/dashboard`) | Hero section, tagline, 5-step workflow cards, feature highlights |
| `/setup` | `Setup.jsx` | `caseData` (for prefilling/defaults) | Form inputs (Deceased Name, Date of Passing, Relationship, Masked PAN, Account count), validation on submit, `updateCaseData()` dispatch, redirect to `/dashboard` | Case intake card, input fields with live/blur error messages, primary CTA button |
| `/dashboard` | `Dashboard.jsx` | `caseData`, `assetList`, `actionList` | Quick action buttons, click on "Needs Attention" items, toggle task status | 4 KPI summary cards (Total Assets, Liabilities, Pending Actions, Closure Progress %), Urgent attention checklist, Recharts pie chart of asset distribution |
| `/assets` | `FinancialInventory.jsx` (New) | `assetList`, `caseData` | Filter by category tab ("All", "Banking", "Investments", "Insurance", "Retirement", "Liabilities", "Subscriptions"), search input, update status modal/dropdown | Categorized asset tables/cards, institution logos/badges, masked account numbers, nominee tags, value in ₹, status badges |
| `/actions` | `ActionCenter.jsx` (New) | `actionList`, `documentList` | Toggle action completion checkbox, filter by priority ("All", "High", "Medium", "Low") or status ("Pending", "Completed"), view required documents | Checklist grouped by urgency/stage, due date badges, institution tags, direct link to associated documents |
| `/documents` | `Documents.jsx` (New) | `documentList` | Filter by category ("Vital", "Financial", "Identity"), simulated file upload, view/download mock trigger | Document vault cards/table, verification status badges (Verified, Pending, Required), file size and date |
| `/timeline` | `Timeline.jsx` (New) | `timelineList`, `caseData` | View milestone status, toggle milestone details | Vertical stepped timeline with colored status nodes, icons, milestone titles, dates, descriptions, and actors |

---

## 4. Authoritative Data Models & Schemas

### 4.1 Case Profile Model (`CaseProfile`)
Represents the core probate / estate closure case record.

```typescript
interface CaseProfile {
  id: string;                      // e.g. "CASE-2026-001"
  deceasedName: string;            // e.g. "Rahul Sharma"
  dateOfPassing: string;           // ISO format: "YYYY-MM-DD", e.g. "2026-07-15"
  relationship: string;            // "Son" | "Daughter" | "Spouse" | "Sibling" | "Parent" | "Legal Representative"
  executorName: string;            // e.g. "Aarav Sharma"
  pan: string;                     // 10-char PAN e.g. "ABCDE1234F" or masked "XXXXX1234X"
  aadhaarMasked?: string;          // e.g. "•••• •••• 5678"
  deathCertificateNumber?: string; // e.g. "MCD/2026/89412"
  accountCount: number;            // estimated count, e.g. 8
  caseStatus: 'Active' | 'Under Review' | 'Completed';
  createdAt: string;               // ISO date: "2026-07-16"
}
```

### 4.2 Financial Inventory Asset Model (`AssetItem`)
Represents accounts, investments, insurance policies, debts, and recurring charges.

```typescript
interface AssetItem {
  id: string;                      // e.g. "asset-1"
  institution: string;             // e.g. "HDFC Bank", "LIC of India", "EPFO"
  category: 'Bank Account' | 'Fixed Deposit' | 'Life Insurance' | 'EPF' | 'PPF' | 'Mutual Funds' | 'Equities' | 'Real Estate' | 'Liability' | 'Subscription';
  type: string;                    // e.g. "Savings Account", "Term Life Policy", "Home Loan", "OTT Subscription"
  accountNumberMasked: string;     // e.g. "A/C •••• 4519", "POL-98234112", "Folio 8291048"
  value: number;                   // Gross monetary value in INR (₹)
  nomineeStatus: 'Registered' | 'Not Registered' | 'Under Verification' | 'None';
  nomineeName?: string;            // e.g. "Aarav Sharma (100%)"
  status: 'Review Required' | 'Claim Not Started' | 'Documents Submitted' | 'In Processing' | 'Settled' | 'Active' | 'Cancellation Required' | 'Cancelled';
  billingCycle?: 'monthly' | 'yearly'; // For subscriptions
  notes?: string;                  // e.g. "Branch visit needed with original death certificate"
}
```

### 4.3 Action Checklist Model (`ActionItem`)
Represents specific closure tasks and statutory requirements.

```typescript
interface ActionItem {
  id: string;                      // e.g. "action-1"
  title: string;                   // e.g. "Submit Death Claim for LIC Policy"
  description: string;             // e.g. "Submit Form 3783, original policy bond and certified death certificate to Connaught Place branch."
  institution: string;             // e.g. "LIC of India"
  category: 'Insurance' | 'Banking' | 'Retirement' | 'Liabilities' | 'Legal & Tax' | 'Subscriptions';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate: string;                 // ISO date: "YYYY-MM-DD"
  status: 'needs' | 'in-progress' | 'completed'; // 'needs' maps to Pending
  stage: 'Immediate (Week 1)' | 'Short Term (Month 1)' | 'Final Closure';
  assetId?: string;                // References AssetItem.id
  requiredDocIds: string[];        // Array of DocumentItem.id references e.g. ["doc-1", "doc-2"]
  completedAt?: string;            // ISO timestamp when resolved
}
```

### 4.4 Document Vault Model (`DocumentItem`)
Represents uploaded or required estate documentation.

```typescript
interface DocumentItem {
  id: string;                      // e.g. "doc-1"
  name: string;                    // Display filename e.g. "Municipal Death Certificate.pdf"
  documentType: 'Death Certificate' | 'PAN Card' | 'Aadhaar Card' | 'Policy Bond' | 'Account Statement' | 'Legal Heir Certificate' | 'Form 16 / ITR';
  category: 'Vital Records' | 'Identity & Tax' | 'Banking & Insurance' | 'Retirement' | 'Legal & Court';
  fileSize: string;                // e.g. "1.8 MB"
  uploadDate: string;              // ISO date: "YYYY-MM-DD"
  status: 'verified' | 'pending' | 'missing' | 'rejected';
  isRequired: boolean;             // True if mandatory for closure
  associatedActionIds?: string[];  // e.g. ["action-1", "action-2"]
}
```

### 4.5 Timeline Milestone Model (`TimelineMilestone`)
Represents audit trail events and progress milestones.

```typescript
interface TimelineMilestone {
  id: string;                      // e.g. "tl-1"
  title: string;                   // e.g. "Closure Case Initialized"
  description: string;             // Detailed event narrative
  date: string;                    // ISO date: "YYYY-MM-DD"
  status: 'completed' | 'inProgress' | 'pending';
  category: 'Setup' | 'Discovery' | 'Claims' | 'Legal' | 'Settlement';
  actor: string;                   // e.g. "Aarav Sharma (Executor)", "EPFO Portal", "HDFC Branch"
  icon: 'FileText' | 'Shield' | 'CheckCircle' | 'Clock' | 'Building' | 'CreditCard';
}
```

### 4.6 Dashboard Derived Metrics & Chart Distribution
Derived programmatically from `assetList` and `actionList`:
- **Total Assets**:
  $$\text{Total Assets} = \sum_{a \in \text{Assets}, a.\text{category} \notin \{\text{Liability}, \text{Subscription}\}} a.\text{value}$$
- **Total Liabilities**:
  $$\text{Total Liabilities} = \sum_{a \in \text{Assets}, a.\text{category} = \text{Liability}} a.\text{value}$$
- **Net Estate Value**:
  $$\text{Net Value} = \text{Total Assets} - \text{Total Liabilities}$$
- **Pending Actions Count**:
  $$\text{Pending Actions} = \text{count}(a \in \text{Actions} \mid a.\text{status} \neq \text{'completed'})$$
- **True Closure Progress %**:
  $$\text{Progress} = \text{round}\left(\frac{\text{count}(a \in \text{Actions} \mid a.\text{status} = \text{'completed'})}{\text{totalActions}} \times 100\right)$$
- **Recharts Asset Distribution Slices**:
  Aggregated by category:
  ```javascript
  const categoryTotals = assetList
    .filter(a => a.category !== 'Liability' && a.category !== 'Subscription')
    .reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + (a.value || 0);
      return acc;
    }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));
  ```

---

## 5. Enhanced Mock Dataset Specification

Below is the complete dataset ready to replace or extend `src/data/mockData.js`:

```javascript
// src/data/mockData.js

export const caseInfo = {
  id: "case-001",
  deceasedName: "Rahul Sharma",
  dateOfDeath: "2026-07-15",
  relationship: "Son",
  executorName: "Aarav Sharma",
  pan: "ABCDE1234F",
  aadhaarMasked: "•••• •••• 9102",
  deathCertificateNumber: "MCD/ND/2026/049182",
  accountCount: 8,
  caseStatus: "Active",
  createdAt: "2026-07-16",
};

export const assets = [
  {
    id: "asset-1",
    institution: "HDFC Bank",
    category: "Bank Account",
    type: "Savings Account",
    accountNumberMasked: "•••• 4519",
    value: 240000,
    nomineeStatus: "Registered",
    nomineeName: "Aarav Sharma",
    status: "Review Required",
    notes: "Requires death certificate and Form DA-2 submission."
  },
  {
    id: "asset-2",
    institution: "Life Insurance Corp (LIC)",
    category: "Life Insurance",
    type: "Jeevan Anand Policy",
    accountNumberMasked: "POL-8941203",
    value: 500000,
    nomineeStatus: "Registered",
    nomineeName: "Aarav Sharma",
    status: "Claim Not Started",
    notes: "Original policy bond located. Form 3783 required."
  },
  {
    id: "asset-3",
    institution: "EPFO",
    category: "EPF",
    type: "Employees' Provident Fund",
    accountNumberMasked: "UAN 1009182390",
    value: 380000,
    nomineeStatus: "Under Verification",
    nomineeName: "Aarav Sharma",
    status: "Nominee Verification",
    notes: "e-Nomination pending validation with employer."
  },
  {
    id: "asset-4",
    institution: "Zerodha (CDSL)",
    category: "Equities",
    type: "Demat & Trading Account",
    accountNumberMasked: "BOID •••• 8192",
    value: 315000,
    nomineeStatus: "Registered",
    nomineeName: "Aarav Sharma",
    status: "Review Required",
    notes: "Transmission request form Annexure A & Client Master Report."
  },
  {
    id: "asset-5",
    institution: "SBI Mutual Fund",
    category: "Mutual Funds",
    type: "Equity Hybrid Folio",
    accountNumberMasked: "Folio •••• 3042",
    value: 185000,
    nomineeStatus: "Registered",
    nomineeName: "Aarav Sharma",
    status: "Review Required",
    notes: "MF Central / CAMS transmission workflow initiated."
  },
  {
    id: "asset-6",
    institution: "Home Loan Co (HDFC Ltd)",
    category: "Liability",
    type: "Home Loan Outstanding",
    accountNumberMasked: "HL-901823",
    value: 120000,
    nomineeStatus: "None",
    status: "Active",
    notes: "Check whether insurance rider covers loan balance."
  },
  {
    id: "asset-7",
    institution: "ICICI Credit Card",
    category: "Liability",
    type: "Credit Card Balance",
    accountNumberMasked: "CC •••• 9921",
    value: 28000,
    nomineeStatus: "None",
    status: "Active",
    notes: "Card blocked. Final statement balance pending settlement."
  },
  {
    id: "asset-8",
    institution: "Netflix",
    category: "Subscription",
    type: "Monthly Digital Streaming",
    accountNumberMasked: "•••• rahul@gmail.com",
    value: 649,
    billingCycle: "monthly",
    nomineeStatus: "None",
    status: "Cancellation Required",
    notes: "Auto-debit recurring from HDFC card."
  },
];

export const actions = [
  {
    id: "action-1",
    title: "Submit insurance death claim to LIC",
    description: "Submit original policy document, certified death certificate, and Form 3783 to the home branch.",
    institution: "LIC of India",
    category: "Insurance",
    priority: "high",
    dueDate: "2026-09-30",
    status: "needs",
    stage: "Immediate (Week 1)",
    assetId: "asset-2",
    requiredDocIds: ["doc-1", "doc-2", "doc-3"]
  },
  {
    id: "action-2",
    title: "Verify EPFO e-nomination & submit Form 20",
    description: "Submit Form 20 (EPF settlement) and Form 10D (pension) via unified member portal.",
    institution: "EPFO",
    category: "Retirement",
    priority: "medium",
    dueDate: "2026-10-05",
    status: "needs",
    stage: "Short Term (Month 1)",
    assetId: "asset-3",
    requiredDocIds: ["doc-1", "doc-2", "doc-4"]
  },
  {
    id: "action-3",
    title: "Submit account transmission request at HDFC Bank",
    description: "Present death certificate, claimant KYC, and passbook at Indiranagar branch.",
    institution: "HDFC Bank",
    category: "Banking",
    priority: "urgent",
    dueDate: "2026-09-28",
    status: "needs",
    stage: "Immediate (Week 1)",
    assetId: "asset-1",
    requiredDocIds: ["doc-1", "doc-2", "doc-5"]
  },
  {
    id: "action-4",
    title: "Review home loan insurance coverage",
    description: "Verify if loan protection insurance policy covers outstanding balance of ₹1,20,000.",
    institution: "Home Loan Co",
    category: "Liabilities",
    priority: "medium",
    dueDate: "2026-10-10",
    status: "needs",
    stage: "Short Term (Month 1)",
    assetId: "asset-6",
    requiredDocIds: ["doc-1"]
  },
  {
    id: "action-5",
    title: "Cancel recurring Netflix & streaming auto-debits",
    description: "Cancel recurring mandate on registered credit/debit cards to prevent unbilled renewals.",
    institution: "Netflix",
    category: "Subscriptions",
    priority: "low",
    dueDate: "2026-09-20",
    status: "completed",
    stage: "Immediate (Week 1)",
    assetId: "asset-8",
    requiredDocIds: []
  },
  {
    id: "action-6",
    title: "Initiate Demat shares transmission via Zerodha",
    description: "Send Annexure A transmission form, Client Master Report, and notarized death certificate.",
    institution: "Zerodha",
    category: "Banking",
    priority: "medium",
    dueDate: "2026-10-15",
    status: "needs",
    stage: "Short Term (Month 1)",
    assetId: "asset-4",
    requiredDocIds: ["doc-1", "doc-2"]
  }
];

export const documents = [
  {
    id: "doc-1",
    name: "Municipal Death Certificate.pdf",
    documentType: "Death Certificate",
    category: "Vital Records",
    fileSize: "1.8 MB",
    uploadDate: "2026-07-20",
    status: "verified",
    isRequired: true,
    associatedActionIds: ["action-1", "action-2", "action-3", "action-4", "action-6"]
  },
  {
    id: "doc-2",
    name: "PAN Card - Rahul Sharma.pdf",
    documentType: "PAN Card",
    category: "Identity & Tax",
    fileSize: "0.9 MB",
    uploadDate: "2026-07-01",
    status: "verified",
    isRequired: true,
    associatedActionIds: ["action-1", "action-2", "action-3", "action-6"]
  },
  {
    id: "doc-3",
    name: "LIC Policy Bond (POL-8941203).pdf",
    documentType: "Policy Bond",
    category: "Banking & Insurance",
    fileSize: "3.4 MB",
    uploadDate: "2025-12-10",
    status: "verified",
    isRequired: true,
    associatedActionIds: ["action-1"]
  },
  {
    id: "doc-4",
    name: "EPFO Member Passbook 2026.pdf",
    documentType: "Account Statement",
    category: "Retirement",
    fileSize: "1.2 MB",
    uploadDate: "2026-01-15",
    status: "pending",
    isRequired: true,
    associatedActionIds: ["action-2"]
  },
  {
    id: "doc-5",
    name: "HDFC Savings Account Statement.pdf",
    documentType: "Account Statement",
    category: "Banking & Insurance",
    fileSize: "2.1 MB",
    uploadDate: "2026-06-30",
    status: "verified",
    isRequired: true,
    associatedActionIds: ["action-3"]
  },
  {
    id: "doc-6",
    name: "Legal Heir Certificate Application.pdf",
    documentType: "Legal Heir Certificate",
    category: "Legal & Court",
    fileSize: "2.8 MB",
    uploadDate: "2026-08-10",
    status: "pending",
    isRequired: false,
    associatedActionIds: []
  }
];

export const timeline = [
  {
    id: "tl-1",
    title: "Closure Case Registered",
    description: "Aarav Sharma initialized the digital closure case. Initial PAN record linked.",
    date: "2026-07-16",
    status: "completed",
    category: "Setup",
    actor: "Aarav Sharma (Executor)",
    icon: "FileText"
  },
  {
    id: "tl-2",
    title: "Municipal Death Certificate Verified",
    description: "Official certificate issued by Municipal Corporation verified and archived in vault.",
    date: "2026-07-20",
    status: "completed",
    category: "Legal",
    actor: "Municipal Authority",
    icon: "Shield"
  },
  {
    id: "tl-3",
    title: "Financial Accounts & Demat Discovered",
    description: "Discovered 8 primary financial accounts across 5 institutions totaling ₹16.2L in gross assets.",
    date: "2026-07-25",
    status: "completed",
    category: "Discovery",
    actor: "Aasra Intake Engine",
    icon: "Building"
  },
  {
    id: "tl-4",
    title: "Digital Subscriptions Terminated",
    description: "Recurring Netflix and card auto-debits successfully cancelled.",
    date: "2026-08-02",
    status: "completed",
    category: "Settlement",
    actor: "Executor",
    icon: "CheckCircle"
  },
  {
    id: "tl-5",
    title: "Life Insurance & EPF Claims In Progress",
    description: "Claim dossiers submitted to LIC branch and EPFO member portal.",
    date: "2026-08-15",
    status: "inProgress",
    category: "Claims",
    actor: "LIC / EPFO",
    icon: "Clock"
  },
  {
    id: "tl-6",
    title: "Final Estate Settlement & NOC",
    description: "Final account closures, issuance of bank NOCs, and distribution to lawful heirs.",
    date: "2026-10-31",
    status: "pending",
    category: "Settlement",
    actor: "All Institutions",
    icon: "CheckCircle"
  }
];
```

---

## 6. Target State Architecture (`AppContext.jsx`)

The proposed state architecture resolves all synchronization, persistence, and computation problems:

```javascript
// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import {
  caseInfo as initialCaseInfo,
  assets as initialAssets,
  actions as initialActions,
  documents as initialDocuments,
  timeline as initialTimeline,
} from '../data/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // LocalStorage-backed state with initial mockData fallback
  const [caseData, setCaseData] = useState(() => {
    const saved = localStorage.getItem('aasra_case');
    return saved ? JSON.parse(saved) : initialCaseInfo;
  });

  const [assetList, setAssetList] = useState(() => {
    const saved = localStorage.getItem('aasra_assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [actionList, setActionList] = useState(() => {
    const saved = localStorage.getItem('aasra_actions');
    return saved ? JSON.parse(saved) : initialActions;
  });

  const [documentList, setDocumentList] = useState(() => {
    const saved = localStorage.getItem('aasra_documents');
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [timelineList, setTimelineList] = useState(() => {
    const saved = localStorage.getItem('aasra_timeline');
    return saved ? JSON.parse(saved) : initialTimeline;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aasra_case', JSON.stringify(caseData));
  }, [caseData]);

  useEffect(() => {
    localStorage.setItem('aasra_assets', JSON.stringify(assetList));
  }, [assetList]);

  useEffect(() => {
    localStorage.setItem('aasra_actions', JSON.stringify(actionList));
  }, [actionList]);

  useEffect(() => {
    localStorage.setItem('aasra_documents', JSON.stringify(documentList));
  }, [documentList]);

  useEffect(() => {
    localStorage.setItem('aasra_timeline', JSON.stringify(timelineList));
  }, [timelineList]);

  // Case Profile Mutations
  const updateCaseData = (updatedFields) => {
    setCaseData((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  // Action Mutations
  const updateActionStatus = (id, newStatus) => {
    setActionList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const toggleActionStatus = (id) => {
    setActionList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus = item.status === 'completed' ? 'needs' : 'completed';
        return {
          ...item,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
        };
      })
    );
  };

  // Asset Mutations
  const updateAssetStatus = (id, newStatus) => {
    setAssetList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const addAsset = (newAsset) => {
    const id = `asset-${Date.now()}`;
    setAssetList((prev) => [...prev, { ...newAsset, id }]);
  };

  // Document Mutations
  const updateDocumentStatus = (id, newStatus) => {
    setDocumentList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const addDocument = (newDoc) => {
    const id = `doc-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    setDocumentList((prev) => [...prev, { ...newDoc, id, uploadDate: date, status: 'pending' }]);
  };

  // Reset to original mock data
  const resetToDefaults = () => {
    localStorage.clear();
    setCaseData(initialCaseInfo);
    setAssetList(initialAssets);
    setActionList(initialActions);
    setDocumentList(initialDocuments);
    setTimelineList(initialTimeline);
  };

  // Derived Metrics
  const totalAssets = assetList
    .filter((a) => a.category !== 'Liability' && a.category !== 'Subscription')
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  const totalLiabilities = assetList
    .filter((a) => a.category === 'Liability')
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  const netEstateValue = totalAssets - totalLiabilities;

  const totalActionsCount = actionList.length;
  const completedActionsCount = actionList.filter((a) => a.status === 'completed').length;
  const pendingActionsCount = totalActionsCount - completedActionsCount;

  // Real task-based closure progress calculation
  const closureProgress = totalActionsCount > 0
    ? Math.round((completedActionsCount / totalActionsCount) * 100)
    : 0;

  // Recharts Pie Chart Data (Category breakdown)
  const categoryTotals = assetList
    .filter((a) => a.category !== 'Liability' && a.category !== 'Subscription')
    .reduce((acc, a) => {
      const cat = a.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(a.value) || 0);
      return acc;
    }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const value = {
    // State
    caseData,
    assetList,
    actionList,
    documentList,
    timelineList,
    // Mutations
    updateCaseData,
    updateActionStatus,
    toggleActionStatus,
    updateAssetStatus,
    addAsset,
    updateDocumentStatus,
    addDocument,
    resetToDefaults,
    // Derived Metrics
    totalAssets,
    totalLiabilities,
    netEstateValue,
    totalActionsCount,
    completedActionsCount,
    pendingActionsCount,
    closureProgress,
    pieData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
```

---

## 7. Implementation Roadmap & Concrete Recommendations

### 7.1 Router & Navigation Fixes (`App.jsx` & `Sidebar.jsx`)
1. **Update `App.jsx` Routes**:
   Ensure all 7 routes from R1 exist:
   ```jsx
   <Routes>
     <Route path="/" element={<Landing />} />
     <Route path="/setup" element={<Setup />} />
     <Route path="/dashboard" element={<Dashboard />} />
     <Route path="/assets" element={<FinancialInventory />} />
     <Route path="/actions" element={<ActionCenter />} />
     <Route path="/documents" element={<Documents />} />
     <Route path="/timeline" element={<Timeline />} />
     <Route path="*" element={<Navigate to="/" replace />} />
   </Routes>
   ```
2. **Fix `Sidebar.jsx`**:
   - Change `'Overview'` route from `to: '/'` to `to: '/dashboard'` so users in the app remain in the workspace.
   - Fix line 23 template literal bug:
     ```jsx
     className={({ isActive }) =>
       `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
         isActive ? 'bg-indigo-50 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'
       }`
     }
     ```
   - Add a subtle logo or home link in Topbar / Sidebar header to easily return to Landing (`/`).

### 7.2 Setup Form Wiring (`Setup.jsx`)
1. Consume `updateCaseData` from `AppContext`.
2. On `handleSubmit`, call:
   ```javascript
   updateCaseData({
     deceasedName: form.deceasedName.trim(),
     dateOfDeath: form.dateOfDeath,
     relationship: form.relationship,
     pan: form.pan.toUpperCase(),
     accountCount: Number(form.accountCount) || 1,
   });
   navigate('/dashboard');
   ```
3. Implement form validation inline error display (enforcing R2).

### 7.3 Dashboard Refinements (`Dashboard.jsx`)
1. Consume pre-computed metrics (`totalAssets`, `totalLiabilities`, `pendingActionsCount`, `closureProgress`, `pieData`) from `AppContext`.
2. Render active case banner displaying `caseData.deceasedName`, `caseData.relationship`, and masked PAN.
3. Use formatted Indian Rupee strings: `₹${value.toLocaleString('en-IN')}`.
4. Add interactive toggle or status badge in the "Needs Attention" list.

### 7.4 Placeholder & Full Components for R3 (`Assets`, `Actions`, `Documents`, `Timeline`)
Per R3, if any component is initially scaffolded as a placeholder, it must contain a prominent heading indicating the page is a placeholder or work-in-progress, but the enhanced mock data enables rendering high-fidelity interactive versions immediately:
- `FinancialInventory`: Tabbed filtering across Banking, Investments, Insurance, Liabilities, and Subscriptions.
- `ActionCenter`: Interactive task checklist with category filter and instant completion toggles.
- `Documents`: Vault table with status indicators (Verified, Pending, Missing) and simulated file picker.
- `Timeline`: Vertical sequence of milestones using Lucide icons (`FileText`, `Shield`, `Building`, `CheckCircle`).
