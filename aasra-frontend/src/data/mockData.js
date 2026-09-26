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
    period: "monthly",
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
    due: "2026-09-30",
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
    due: "2026-10-05",
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
    due: "2026-09-28",
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
    due: "2026-10-10",
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
    due: "2026-09-20",
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
    due: "2026-10-15",
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
    date: "2026-07-20",
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
    date: "2026-07-01",
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
    date: "2025-12-10",
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
    date: "2026-01-15",
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
    date: "2026-06-30",
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
    date: "2026-08-10",
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
