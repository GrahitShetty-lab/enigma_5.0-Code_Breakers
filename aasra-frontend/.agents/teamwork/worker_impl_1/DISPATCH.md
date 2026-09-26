# Dispatch: Worker 1 (Implementation Track - Full Aasra Frontend)

## Mission
Implement the full Aasra Digital Estate Closure Assistant frontend in accordance with R1-R4 and AC1-AC8, using React, Tailwind CSS, React Router, mock data, and form validation.

## Working Directory
`C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\worker_impl_1`

## Authoritative Inputs
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\orchestrator\PROJECT.md`
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_1\survey_codebase.md`
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_2\survey_data_state.md`
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_3\survey_design_verification.md`

## Write Ownership (Exclusive)
- `src/data/mockData.js`
- `src/context/AppContext.jsx`
- `src/components/layout/Layout.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/Topbar.jsx`
- `src/pages/Landing.jsx`
- `src/pages/Setup.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/FinancialInventory.jsx`
- `src/pages/ActionCenter.jsx`
- `src/pages/Documents.jsx`
- `src/pages/Timeline.jsx`
- `src/App.jsx`
- `tailwind.config.js`
- `index.html`
- `src/index.css`

## Scope of Work

### 1. Foundation, Routing & Layout (M1, R1, R4, AC6, AC7)
- **`Sidebar.jsx`**:
  - Fix template literal concatenation bug on line 23.
  - Route `'Overview'` to `/dashboard` (or add separate Home link to `/`).
  - Implement mobile slide-out drawer mode when triggered, complete with backdrop overlay and auto-close when a nav link is clicked.
- **`Topbar.jsx`**:
  - Add hamburger button (`Menu` icon from `lucide-react`) on mobile (`md:hidden`) with `aria-label="Open navigation menu"`.
- **`Layout.jsx`**:
  - State management for mobile drawer (`mobileMenuOpen`), passing handlers to Topbar and Sidebar.
- **`App.jsx`**:
  - Register all 7 routes: `/` (Landing), `/setup` (Setup), `/dashboard` (Dashboard), `/assets` (FinancialInventory), `/actions` (ActionCenter), `/documents` (Documents), `/timeline` (Timeline), plus wildcard redirect.
- **Design Tokens & Fonts**:
  - Add Inter preconnect in `index.html`.
  - In `tailwind.config.js`, configure `fontFamily.sans` with `Inter` and extend fintech color tokens (canvas, textPrimary, primary, success, pending, urgent, border).

### 2. State Management & Realistic Mock Data (M2, R1, AC4)
- **`mockData.js`**:
  - Update with rich Indian estate closure mock data (Rahul Sharma / Aarav Sharma, HDFC Bank, LIC, EPFO, Demat/Zerodha, SBI Mutual Fund, Home Loan, Netflix).
- **`AppContext.jsx`**:
  - Implement persistent state (synced with `localStorage`).
  - Provide `updateCaseData`, `toggleActionStatus`, `updateActionStatus`, `updateAssetStatus`, `addAsset`, `updateDocumentStatus`, `addDocument`, `resetToDefaults`.
  - Expose derived metrics: `totalAssets`, `totalLiabilities`, `netEstateValue`, `totalActionsCount`, `completedActionsCount`, `pendingActionsCount`, `closureProgress` (action-based percentage), `pieData` (category breakdown).
  - Eliminate all Oxlint warnings (no unused setters, valid component exports).

### 3. Landing Page (M3, R1, AC2)
- Render hero section displaying `src/assets/hero.png`.
- Display tagline `"Bringing clarity to financial closure."`.
- Display primary CTA ("Start a Closure Case" -> `/setup`) and secondary CTA ("Explore Demo Dashboard" -> `/dashboard`).
- Display 5-step workflow explanation cards with icons.

### 4. Setup Page & Form Validation (M4, R1, R2, AC3)
- Fields:
  - Deceased Full Name (text, trimmed $\ge 2$ chars)
  - Executor / Claimant Full Name (text, trimmed $\ge 2$ chars)
  - Date of Passing (`type="date"`, valid past date $\le$ today)
  - Relationship to Deceased (`<select>` dropdown: "Spouse", "Son", "Daughter", "Parent", "Sibling", "Legal Heir", "Other")
  - PAN (`type="text"`, regex: `^([A-Z]{5}[0-9]{4}[A-Z]|XXXXX[0-9]{4}[A-Z])$` with auto-uppercase)
  - Approx. number of financial accounts (`type="number"`, integer $\ge 0$)
- Inline error messages:
  - Display clear red error message beneath any invalid field upon submit or blur.
- Navigation Barrier:
  - STRICTLY prevent navigation to `/dashboard` until all required fields pass validation.
- On valid submit:
  - Commit data to `AppContext` via `updateCaseData` and navigate to `/dashboard`.

### 5. Estate Module Placeholders & Pages (M5, R1, R3, AC5)
- **`FinancialInventory.jsx`** (`/assets`):
  - Heading: "Financial Inventory" + Badge: "Module Preview / Placeholder".
  - Renders asset catalog from `AppContext` (category tabs: Banking, Insurance, Retirement, Equities, Liabilities, Subscriptions) with INR formatting.
- **`ActionCenter.jsx`** (`/actions`):
  - Heading: "Action Center" + Badge: "Module Preview / Placeholder".
  - Renders action items from `AppContext` with priority chips and interactive status toggles (`toggleActionStatus`).
- **`Documents.jsx`** (`/documents`):
  - Heading: "Document Vault" + Badge: "Module Preview / Placeholder".
  - Renders document list from `AppContext` with category tags, file sizes, and verification status badges.
- **`Timeline.jsx`** (`/timeline`):
  - Heading: "Closure Milestones Timeline" + Badge: "Module Preview / Placeholder".
  - Renders vertical milestone list with icons, dates, actors, and status badges.

### 6. Dashboard (M6, R1, AC4)
- Summary cards: Total Assets, Liabilities, Pending Actions, Closure Progress %.
- Case profile banner: Deceased name, relation, masked PAN.
- Needs Attention list: prioritized action items with interactive toggle.
- Recharts Pie Chart: category breakdown of assets with color legend.

### 7. Build & Lint Verification (AC1, AC8)
- Run `npm run build` and ensure clean exit code 0.
- Run `npm run lint` (`oxlint`) and ensure zero errors and zero warnings.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-26T05:51:08Z
<USER_REQUEST>
You are Worker 1 for the Aasra Digital Estate Closure Assistant project.
Your working directory is: C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\worker_impl_1
Read your task assignment from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\worker_impl_1\DISPATCH.md
Read the authoritative requirements from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\orchestrator\PROJECT.md
Read the architectural findings from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_1\survey_codebase.md
Read the data models and state architecture from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_2\survey_data_state.md
Read the design & validation specifications from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_3\survey_design_verification.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement the full frontend:
1. M1: Fix Sidebar.jsx (string interpolation bug, active state, mobile drawer panel with backdrop & auto-close), Topbar.jsx (hamburger button on mobile), Layout.jsx (drawer state), App.jsx (7 routes), tailwind.config.js (Inter font, fintech colors), index.html (Inter font preconnect).
2. M2: mockData.js (enhanced Indian estate data), AppContext.jsx (localStorage persistence, updateCaseData, toggleActionStatus, derived metrics, zero Oxlint warnings).
3. M3: Landing.jsx (hero section with hero.png, tagline, CTAs, 5-step cards).
4. M4: Setup.jsx (form validation: names >=2 chars, date <= today, relationship dropdown, PAN regex ^([A-Z]{5}[0-9]{4}[A-Z]|XXXXX[0-9]{4}[A-Z])$, inline error messages, strict navigation barrier, commit to AppContext).
5. M5: FinancialInventory.jsx (/assets), ActionCenter.jsx (/actions), Documents.jsx (/documents), Timeline.jsx (/timeline) with clear placeholder headings and active mock data rendering.
6. M6: Dashboard.jsx (KPI cards, active case banner, Needs Attention list with interactive toggles, Recharts category pie chart).
7. Run npm run build and npm run lint (oxlint), verify 0 errors and 0 warnings.
8. Document all commands and results in handoff.md and send completion message to parent.
</USER_REQUEST>

