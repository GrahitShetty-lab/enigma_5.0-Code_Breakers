# Survey Report: Visual Design Compliance, Validation Specifications & Acceptance Verification

**Project**: Aasra Digital Estate Closure Assistant  
**Investigator**: Explorer 3 (`explorer_survey_3`)  
**Date**: 2026-09-26  
**Working Directory**: `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_3`  
**Target Repository**: `C:\Users\offic\.gemini\antigravity\scratch\aasra`  
**Authoritative References**: `ORIGINAL_REQUEST.md` (R1-R4, AC1-AC8), `DISPATCH.md`

---

## 1. Executive Summary & Compliance Scorecard

A thorough investigation of the visual design tokens, form validation logic, placeholder specifications, and acceptance verification requirements was conducted for the Aasra Digital Estate Closure Assistant.

### 1.1 Current Compliance Matrix

| Requirement / AC | Description | Current Status | Critical Defect / Gap Identified |
|---|---|---|---|
| **R4 / AC7** | Fintech Color Palette & Inter Font | **Partial** | Palette colors declared in Tailwind but incomplete; `font-sans` not mapped to Inter in Tailwind config; Inter loaded only via CSS `@import`. |
| **R4 / AC6** | Responsive Layout & Mobile Drawer | **Non-Compliant** | Sidebar is hardcoded `hidden md:flex`. `Topbar.jsx` lacks a hamburger toggle button. On viewports `< 768px`, users have **zero navigation capability**. |
| **R2 / AC3** | Setup Form Validation & Navigation Barrier | **Non-Compliant** | Relies solely on native browser `required`. No custom inline error states. Relationship is raw text `<input>` instead of dropdown. PAN regex not evaluated. Form navigates unconditionally to `/dashboard`. |
| **R3 / AC5** | Placeholder Pages (Assets, Actions, Docs, Timeline) | **Non-Compliant** | Four required estate routes (`/assets`, `/actions`, `/documents`, `/timeline`) do not exist in `App.jsx` and have no page components. Sidebar links redirect to `/`. |
| **AC1** | Clean Console Across Routes | **Partial** | 5 Oxlint warnings (broken string literal in `Sidebar.jsx`, unused setters and fast refresh warning in `AppContext.jsx`). Missing routes trigger wildcard redirects. |
| **AC2** | Landing Page Hero, Tagline, CTAs, Workflow | **Partial** | Hero copy and 5 steps are present, but `hero.png` asset is not rendered; page is wrapped in internal dashboard `Layout`. |
| **AC4** | Dashboard Summary Cards, Attention List, Recharts | **Compliant** | Calculations, 4 summary cards, attention list, and Recharts pie chart are present and functional. |
| **AC8** | Clean Build (`npm run build`) | **Compliant** | `npm run build` succeeds cleanly in ~1.9s. |

---

## 2. Visual Design System & Design Tokens (R4, AC7)

### 2.1 Fintech Color Palette Specification
The visual identity of Aasra must inspire trust, dignified calm, financial precision, and clarity during a sensitive life event (estate closure).

#### Palette Tokens
```javascript
// Recommended tailwind.config.cjs extensions:
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Foundation & Canvas
        canvas: "#F8FAFC",       // Slate-50 background for calm readability
        surface: "#FFFFFF",      // Clean card and drawer background
        subtle: "#F1F5F9",       // Slate-100 for secondary backgrounds / chips
        border: "#E2E8F0",       // Slate-200 for clean neutral borders
        borderSubtle: "#CBD5E1", // Slate-300 for inputs and interactive borders
        
        // Typography / Content Hierarchy
        textPrimary: "#0F172A",   // Slate-900 for primary headings and values
        textSecondary: "#475569", // Slate-600 for labels, body, and descriptions
        textMuted: "#94A3B8",     // Slate-400 for placeholders and secondary metadata
        
        // Brand & Primary Trust (Indigo / Navy)
        primary: {
          DEFAULT: "#4F46E5",     // Indigo-600
          hover: "#4338CA",       // Indigo-700
          light: "#EEF2FF",       // Indigo-50 for active nav and accents
          navy: "#1E293B",        // Slate-800 for sidebar branding
        },
        
        // Semantic Status Tokens
        success: {
          DEFAULT: "#10B981",     // Emerald-500 for closed accounts, verified claims
          dark: "#059669",        // Emerald-600
          light: "#ECFDF5",       // Emerald-50 background chips
        },
        pending: {
          DEFAULT: "#F59E0B",     // Amber-500 for actions in progress, review required
          dark: "#D97706",        // Amber-600
          light: "#FFFBEB",       // Amber-50 background chips
        },
        urgent: {
          DEFAULT: "#DC2626",     // Red-600 for overdue deadlines, liabilities, errors
          dark: "#B91C1C",        // Red-700
          light: "#FEF2F2",       // Red-50 background chips & form error states
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        cardHover: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        drawer: "0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
```

### 2.2 Typography System (Inter)
- **Current Observation**:
  - `index.css:2` imports Google Font `Inter` via `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`.
  - `index.html` has no preconnect or font stylesheet link.
  - `tailwind.config.js` does NOT specify `fontFamily.sans`. In `Layout.jsx:7`, `<div className="... font-sans">` uses default Tailwind font (ui-sans-serif) rather than Inter unless explicitly set.
- **Specification**:
  1. Add preconnect and font links into `index.html`:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com" />
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
     ```
  2. Map `font-sans` in `tailwind.config.js` to `["Inter", ...]`.
  3. Define consistent type scale:
     - **H1 / Display**: `text-2xl font-bold tracking-tight text-textPrimary` (or `text-4xl` on Landing)
     - **H2 / Section Title**: `text-xl font-semibold text-textPrimary`
     - **H3 / Card Header**: `text-base font-semibold text-textPrimary`
     - **Body Text**: `text-sm text-textSecondary leading-relaxed`
     - **Labels / Table Headers**: `text-xs font-semibold uppercase tracking-wider text-textSecondary`
     - **Value Badges & Pills**: `text-xs font-medium`

---

## 3. Responsive Layout & Mobile Hamburger Drawer (R4, AC6)

### 3.1 Architectural Defect in Current Codebase
- In `src/components/layout/Sidebar.jsx:15`:
  `<aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4">`
- In `src/components/layout/Topbar.jsx:5`:
  Only renders title and `<Bell />` icon button. No menu toggle.
- In `src/components/layout/Layout.jsx`:
  Has no state or handlers for opening/closing mobile navigation.
- **Result**: On any viewport smaller than `768px` (all mobile devices and narrow tablet portrait), the user cannot navigate to any page.

### 3.2 Target Component Architecture

```
+-----------------------------------------------------------------------------------+
| Topbar (Mobile: md:hidden)                                                         |
| [ ☰ Hamburger Button ]   "Aasra Estate Closure"            [ 🔔 Notifications ]    |
+-----------------------------------------------------------------------------------+
| Mobile Slide-out Drawer (fixed inset-0 z-50, open when isMobileOpen === true)      |
|  +-----------------------------------+--------------------------------------------+
|  | Drawer Panel (w-72 bg-white)      | Dimmed Backdrop Overlay (bg-slate-900/40)   |
|  | - Logo: "Aasra" + [ ✕ Close Button]| (click triggers onClose)                   |
|  | - NavLink: Overview               |                                            |
|  | - NavLink: Financial Inventory    |                                            |
|  | - NavLink: Action Center          |                                            |
|  | - NavLink: Documents              |                                            |
|  | - NavLink: Timeline               |                                            |
|  | - Footer: Settings / Help         |                                            |
|  +-----------------------------------+--------------------------------------------+
+-----------------------------------------------------------------------------------+
| Desktop Layout (md:flex)                                                           |
| +---------------------+----------------------------------------------------------+
| | Fixed Sidebar (w-64)| Main Area: Topbar + Page Content (<main className="p-6">)|
| | - Logo              |                                                          |
| | - NavItems (5)      |                                                          |
| | - Footer            |                                                          |
| +---------------------+----------------------------------------------------------+
```

### 3.3 Precise Implementation Specifications

#### 1. `Layout.jsx`
- Maintain `mobileMenuOpen` boolean state.
- Pass `onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}` to `Topbar`.
- Pass `isOpen={mobileMenuOpen}` and `onClose={() => setMobileMenuOpen(false)}` to `Sidebar` or `MobileDrawer`.

#### 2. `Topbar.jsx`
- Add mobile menu button:
  ```jsx
  <button
    type="button"
    aria-label="Open navigation menu"
    aria-expanded={isOpen}
    onClick={onToggleMobileMenu}
    className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary mr-2"
  >
    <Menu className="w-6 h-6" />
  </button>
  ```

#### 3. `Sidebar.jsx` (or unified `Sidebar` + `MobileDrawer`)
- Render desktop sidebar on `hidden md:flex`.
- Render mobile drawer when `isOpen` is true (or controlled with CSS transform `translate-x-0` vs `-translate-x-full`):
  - Fixed full-screen backdrop: `fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden`
  - Drawer container: `fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-drawer flex flex-col p-5 md:hidden transition-transform ease-in-out duration-300`
  - Close button: `<button aria-label="Close navigation" onClick={onClose}><X className="w-6 h-6 text-slate-500" /></button>`
  - Auto-close on navigation: each `NavLink` includes `onClick={onClose}` so clicking a link immediately transitions route and closes drawer.
  - Keyboard accessibility: Listen for `Escape` keydown to invoke `onClose()`.

#### 4. Fix String Literal Syntax in `Sidebar.jsx`
- Fix lines 22-25:
  ```jsx
  className={({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`
  }
  ```

---

## 4. Setup Form Validation Specification (R2, AC3)

### 4.1 Field-by-Field Requirements & Rules

| Field Name | HTML Element | Label | Validation Rules | Error Message |
|---|---|---|---|---|
| `deceasedName` | `<input type="text">` | Full name of deceased person | Required. Non-empty string. Trimmed length $\ge$ 2 chars. Regex: `/^[a-zA-Z\s.'-]+$/` | "Please enter the deceased person's full name (at least 2 letters)." |
| `executorName` | `<input type="text">` | Executor / Claimant full name | Required. Non-empty string. Trimmed length $\ge$ 2 chars. | "Please enter the executor or claimant's full name." |
| `dateOfDeath` | `<input type="date">` | Date of passing | Required. Valid date format `YYYY-MM-DD`. Cannot be in the future (`selectedDate <= today`). Cannot be older than 50 years. | "Please enter a valid date of passing (cannot be in the future)." |
| `relationship` | `<select>` dropdown | Relationship to deceased | Required. Must select a valid option from list (`Spouse`, `Son`, `Daughter`, `Parent`, `Sibling`, `Legal Heir`, `Executor / Attorney`, `Other`). Empty initial option `""` ("Select relationship..."). | "Please select your relationship to the deceased." |
| `pan` | `<input type="text">` | Deceased PAN (masked or full) | Required. 10 alphanumeric characters matching standard PAN regex or masked pattern: `^([A-Z]{5}[0-9]{4}[A-Z]|XXXXX[0-9]{4}[A-Z])$` (case-insensitive, auto-uppercased). | "Please enter a valid 10-character PAN (e.g. ABCDE1234F or masked XXXXX1234X)." |
| `accountCount` | `<input type="number">` | Approx. number of financial accounts | Required integer $\ge 0$. | "Please enter estimated number of financial accounts (0 or more)." |

### 4.2 PAN Format Specification & Regex Details
In Indian estate closure, family members may have either:
1. The full 10-character alphanumeric PAN of the deceased: 5 uppercase letters, 4 numeric digits, 1 uppercase letter (`[A-Z]{5}[0-9]{4}[A-Z]{1}`).
2. A masked PAN representation from tax/bank statements where first 5 letters are masked: `XXXXX1234X`.
- **Validation Regex**:
  ```javascript
  export const PAN_REGEX = /^([A-Z]{5}[0-9]{4}[A-Z]|XXXXX[0-9]{4}[A-Z])$/;
  ```
- **Input Handler**:
  Automatically uppercase inputs: `e.target.value.toUpperCase().slice(0, 10)`.

### 4.3 UI States & Inline Error Messaging
- Form should track:
  - `values`: object containing form fields
  - `errors`: object mapping field name to error message string
  - `touched`: object mapping field name to boolean (whether field has been blurred or form submitted)
- **Inline Error Component**:
  ```jsx
  {touched[fieldName] && errors[fieldName] && (
    <p id={`${fieldName}-error`} className="mt-1.5 text-xs text-urgent font-medium flex items-center gap-1.5">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-urgent" />
      <span>{errors[fieldName]}</span>
    </p>
  )}
  ```
- **Input Border Styling**:
  ```jsx
  className={`w-full px-3.5 py-2 text-sm rounded-lg border transition-colors ${
    touched[fieldName] && errors[fieldName]
      ? 'border-urgent bg-urgent-light/30 focus:border-urgent focus:ring-urgent/20'
      : 'border-slate-300 focus:border-primary focus:ring-primary/20'
  }`}
  ```

### 4.4 Navigation Barrier (AC3)
- `handleSubmit` function logic:
  ```javascript
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      deceasedName: true,
      executorName: true,
      dateOfDeath: true,
      relationship: true,
      pan: true,
      accountCount: true,
    });
    
    const validationErrors = validateAll(form);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      // Focus first erroneous field
      const firstField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstField);
      if (element) element.focus();
      return; // STRICT NAVIGATION BARRIER: do NOT proceed
    }
    
    // Save to AppContext
    updateCaseData({
      deceasedName: form.deceasedName.trim(),
      executorName: form.executorName.trim(),
      dateOfDeath: form.dateOfDeath,
      relationship: form.relationship,
      pan: form.pan.toUpperCase().trim(),
      accountCount: parseInt(form.accountCount, 10) || 0,
      setupCompleted: true,
    });
    
    // Navigate only after valid submission
    navigate('/dashboard');
  };
  ```

---

## 5. Placeholder Pages Specification (R3, AC5)

The requirements specify that all links in the sidebar must route to valid views. Where the full interactive estate module is still in progress, a dedicated placeholder component must render with clear placeholder headings and relevant mock data.

### 5.1 Route Mapping Table

| Navigation Label | Route Path | Component | Icon | Required Placeholder Indicator |
|---|---|---|---|---|
| **Overview** | `/` | `Landing.jsx` | `Home` | Public landing page / onboarding overview |
| **Setup** | `/setup` | `Setup.jsx` | `FilePlus` | Interactive case creation form with validation |
| **Dashboard** | `/dashboard` | `Dashboard.jsx` | `LayoutDashboard` | Full estate closure dashboard with Recharts |
| **Financial Inventory** | `/assets` | `FinancialInventory.jsx` | `LayoutGrid` | **Placeholder Heading**: "Financial Inventory" + Badge: "Module Preview / Placeholder" |
| **Action Center** | `/actions` | `ActionCenter.jsx` | `ListTodo` | **Placeholder Heading**: "Action Center" + Badge: "Module Preview / Placeholder" |
| **Documents** | `/documents` | `Documents.jsx` | `FileText` | **Placeholder Heading**: "Document Vault" + Badge: "Module Preview / Placeholder" |
| **Timeline** | `/timeline` | `Timeline.jsx` | `Clock` | **Placeholder Heading**: "Closure Milestones Timeline" + Badge: "Module Preview / Placeholder" |

### 5.2 Component Structure for Placeholders

#### A. `FinancialInventory.jsx` (`/assets`)
- **Heading**:
  ```jsx
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-textPrimary">Financial Inventory</h1>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Module Preview
        </span>
      </div>
      <p className="text-sm text-textSecondary mt-1">Catalog of bank accounts, life insurance policies, EPF balances, and liabilities.</p>
    </div>
  </div>
  ```
- **Content**:
  - Displays table or cards of `assetList` from `AppContext` (HDFC Bank, LIC, EPFO, Home Loan, Netflix).
  - Categorized values formatted in Indian Rupee format (`₹{val.toLocaleString('en-IN')}`).
  - Status badges with fintech colors:
    - "Review Required" -> `bg-amber-50 text-amber-700 border-amber-200`
    - "Claim Not Started" -> `bg-slate-100 text-slate-700`
    - "Nominee Verification" -> `bg-indigo-50 text-indigo-700`
    - "Active" (Liability) -> `bg-rose-50 text-rose-700`
  - Informative banner: "Automated account aggregator synchronization and claim form autofill are currently in preview."

#### B. `ActionCenter.jsx` (`/actions`)
- **Heading**:
  ```jsx
  <div className="flex items-center gap-2 mb-2">
    <h1 className="text-2xl font-bold text-textPrimary">Action Center</h1>
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      Module Preview
    </span>
  </div>
  ```
- **Content**:
  - Renders prioritized checklist from `actionList` (LIC claim, EPF nominee, Home loan, Netflix).
  - Priority badges (`high` -> Red, `medium` -> Amber, `low` -> Slate).
  - Status toggle buttons allowing user to toggle between `needs` and `completed` using `updateActionStatus(id, newStatus)`.
  - Placeholder banner: "Automated notification engine and legal filing workflows will be enabled upon authority portal connection."

#### C. `Documents.jsx` (`/documents`)
- **Heading**:
  ```jsx
  <div className="flex items-center gap-2 mb-2">
    <h1 className="text-2xl font-bold text-textPrimary">Document Vault</h1>
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      Module Preview
    </span>
  </div>
  ```
- **Content**:
  - Grid or list of `documentList` from `AppContext` (`Death Certificate.pdf`, `PAN Card.pdf`, `LIC Policy.pdf`, etc.).
  - Category tags (`Death-related`, `Identity`, `Financial`).
  - Realistic file upload dropzone mockup (e.g., "Drop death certificates or legal heir certificates here to auto-extract details").

#### D. `Timeline.jsx` (`/timeline`)
- **Heading**:
  ```jsx
  <div className="flex items-center gap-2 mb-2">
    <h1 className="text-2xl font-bold text-textPrimary">Closure Milestones Timeline</h1>
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      Module Preview
    </span>
  </div>
  ```
- **Content**:
  - Vertical timeline layout with vertical joining line (`border-l-2 border-slate-200 ml-4`).
  - Milestone icons based on status:
    - `completed` -> `<CheckCircle className="text-emerald-500 bg-white" />`
    - `inProgress` -> `<Clock className="text-amber-500 bg-white" />`
    - `pending` -> `<Circle className="text-slate-400 bg-white" />`
  - Milestone title, date, status chip, and progress notes.

---

## 6. Acceptance Criteria Deep-Dive & Automated Verification Plan (AC1 - AC8)

This section operationalizes AC1 through AC8 into concrete assertions, automated test commands, and pass/fail thresholds.

### AC1: All Listed Routes Load Without Console Errors
- **Acceptance Statement**: Navigating to every defined route (`/`, `/setup`, `/dashboard`, `/assets`, `/actions`, `/documents`, `/timeline`) must emit zero `console.error` and zero `console.warn` events.
- **Vulnerabilities to Watch**:
  - Fast refresh warning in `AppContext.jsx` (exporting context and provider together).
  - Unused variable warnings from Oxlint.
  - Recharts `ResponsiveContainer` dimension warning (`width(-100) or height(-100)` when rendered in virtual or unmeasured container).
  - React missing `key` prop warnings in lists.
  - React Router wildcard redirects for valid navigation links.
- **Automated Verification Method**:
  - Headless script launching browser (or Vitest + JSDOM) attaching `page.on('console', msg => ...)` and `page.on('pageerror', err => ...)`.
  - Asserts `errors.length === 0` and `warnings.length === 0` across full navigation traversal.

### AC2: Landing Page Hero, Tagline, CTAs, and Workflow Explanation
- **Acceptance Statement**: The landing page displays the Aasra hero title, the tagline `"Bringing clarity to financial closure."`, clear CTAs ("Start a Closure Case" navigating to `/setup`), and the 5-step workflow explanation.
- **Verification Assertions**:
  1. Header/Logo: Text `"Aasra"` visible.
  2. Tagline: Text `"Bringing clarity to financial closure."` visible in DOM.
  3. CTAs: Button or Link with text matching `"Start a Closure Case"` exists with `href="/setup"`.
  4. Workflow steps: Elements containing `"1. Add basic details"`, `"2. Organize financial information"`, `"3. Identify pending actions"`, `"4. Track claims and documents"`, `"5. Reach financial closure"` all exist.

### AC3: Setup Form Validation & Navigation Barrier
- **Acceptance Statement**: Setup form validates required fields (names, date, relationship, masked PAN) with inline error messages and strictly blocks navigation to `/dashboard` until valid data is entered.
- **Verification Assertions**:
  1. Initial empty state: Submit button clicked $\rightarrow$ URL remains `/setup`.
  2. Inline error messages appear for empty `deceasedName`, `dateOfDeath`, `relationship`, `pan`.
  3. Invalid PAN test: Enter `INVALID123` $\rightarrow$ Submit $\rightarrow$ URL remains `/setup`, PAN error message is visible: `"Please enter a valid 10-character PAN"`.
  4. Future date test: Enter tomorrow's date $\rightarrow$ Submit $\rightarrow$ Date error message visible: `"cannot be in the future"`.
  5. Unselected relationship test: Leave dropdown on placeholder $\rightarrow$ Submit $\rightarrow$ Relationship error message visible.
  6. Valid submission test: Enter valid name `"Rahul Sharma"`, valid past date `"2026-07-15"`, select `"Son"`, enter `"XXXXX1234X"`, enter `8` accounts $\rightarrow$ Submit $\rightarrow$ Navigation succeeds to `/dashboard`.

### AC4: Dashboard Summary Cards, Needs-Attention List, and Recharts Pie Chart
- **Acceptance Statement**: Dashboard displays 4 summary metrics (Total Assets, Liabilities, Pending Actions, Closure Progress), the Needs Attention list with action cards, and a Recharts SVG pie chart populated from mock data.
- **Verification Assertions**:
  1. Summary Cards: 4 distinct card containers visible.
     - Total Assets contains formatted currency (e.g. `₹1,120,000`).
     - Liabilities contains formatted currency (e.g. `₹120,000`).
     - Pending Actions contains count `4`.
     - Closure Progress contains percentage `89%`.
  2. Needs Attention List: Renders at least 4 items including `"Submit insurance claim"` and `"Verify EPF nominee"`.
  3. Recharts Chart: DOM contains SVG element `.recharts-surface`, `.recharts-pie`, and multiple `.recharts-pie-sector` or `path` elements with fill colors matching the color palette.

### AC5: Financial Inventory, Action Center, Documents, and Timeline Placeholder Pages
- **Acceptance Statement**: `/assets`, `/actions`, `/documents`, and `/timeline` render without error, displaying clear placeholder headings/badges and bound mock data.
- **Verification Assertions**:
  1. Navigating to `/assets` $\rightarrow$ Heading `"Financial Inventory"` + badge containing `"Preview"` or `"Placeholder"`. Renders mock assets (HDFC, LIC, EPFO).
  2. Navigating to `/actions` $\rightarrow$ Heading `"Action Center"` + badge. Renders mock action tasks.
  3. Navigating to `/documents` $\rightarrow$ Heading `"Document Vault"` + badge. Renders mock documents (`Death Certificate.pdf`, `PAN Card.pdf`).
  4. Navigating to `/timeline` $\rightarrow$ Heading `"Closure Milestones Timeline"` + badge. Renders mock milestone steps.

### AC6: Responsive Layout (Desktop Sidebar + Mobile Hamburger Slide-Out Drawer)
- **Acceptance Statement**: Layout shows persistent sidebar on desktop ($W \ge 768\text{px}$) and collapses to a mobile hamburger drawer on mobile ($W < 768\text{px}$) with fully functioning navigation links.
- **Verification Assertions**:
  1. Desktop Viewport ($1280 \times 800$):
     - Sidebar `<aside>` is visible (`display: flex`).
     - Hamburger button in Topbar is hidden (`display: none` or not rendered).
  2. Mobile Viewport ($375 \times 667$):
     - Desktop sidebar is hidden (`display: none`).
     - Hamburger menu button is visible in Topbar.
     - Click hamburger button $\rightarrow$ Drawer opens (backdrop visible, drawer slide-in container visible).
     - Click "Financial Inventory" in drawer $\rightarrow$ Navigation to `/assets` occurs, drawer closes.

### AC7: Fintech Color Scheme & Inter Font Compliance
- **Acceptance Statement**: All pages use the specified fintech color scheme (slate/navy/emerald/amber/red/indigo) and apply the Inter font family.
- **Verification Assertions**:
  1. Font family computed on `document.body` or `#root` contains `"Inter"`.
  2. Primary buttons utilize `#4F46E5` / `rgb(79, 70, 229)`.
  3. Border colors on cards/tables adhere to neutral slate palette (`rgb(226, 232, 240)` / `border-slate-200`).
  4. Status badges match defined semantic tones (emerald, amber, red).

### AC8: Clean Build & Zero Runtime Errors
- **Acceptance Statement**: Application compiles cleanly with `npm run build` and passes `npm run lint` with zero errors.
- **Verification Assertions**:
  1. `npm run build` exits with code `0`.
  2. Emits valid production bundle in `dist/`.
  3. `npm run lint` exits with code `0` and 0 errors / 0 warnings.

---

## 7. Recommended Test Harness Architecture for E2E Testing Track

To ensure reliable, automated, opaque-box verification without manual browser clicking, the E2E Testing track should implement an automated verification script.

### 7.1 Automated Route & Console Checker (`scripts/verify-e2e.mjs`)
A lightweight, self-contained verification runner can be provided using Node.js + Playwright (or Puppeteer / Chromium) to automate the acceptance criteria:

```javascript
// Architecture outline for scripts/verify-e2e.mjs
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const ROUTES = ['/', '/setup', '/dashboard', '/assets', '/actions', '/documents', '/timeline'];

async function runAcceptanceSuite() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleLogs.push({ type: msg.type(), text: msg.text(), location: msg.location() });
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  // AC1: Clean console across all routes
  for (const route of ROUTES) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  }

  // AC2: Landing page assertions
  await page.goto(`${BASE_URL}/`);
  // Assert tagline, CTAs, 5-step cards...

  // AC3: Setup form validation & barrier
  await page.goto(`${BASE_URL}/setup`);
  // Attempt invalid submission -> assert still on /setup, error visible
  // Fill valid form -> submit -> assert on /dashboard

  // AC4: Dashboard metrics & Recharts
  await page.goto(`${BASE_URL}/dashboard`);
  // Assert summary cards, pie chart SVG

  // AC5: Placeholder headings on /assets, /actions, /documents, /timeline
  for (const route of ['/assets', '/actions', '/documents', '/timeline']) {
    await page.goto(`${BASE_URL}${route}`);
    // Assert heading and placeholder badge
  }

  // AC6: Mobile viewport & hamburger drawer
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${BASE_URL}/dashboard`);
  // Assert hamburger button visible, desktop sidebar hidden
  // Click hamburger -> assert drawer open
  // Click link -> assert navigation and drawer closed

  // AC7: Computed font and color check
  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  // Assert Inter in bodyFont

  await browser.close();
}
```

### 7.2 Alternative Zero-Dependency Headless Node Verification
If external headless browser installation is constrained by network or security, a headless DOM suite (or component tests using `@testing-library/react` or direct Vite preview testing) can verify:
1. Static analysis of build artifacts in `dist/`.
2. Oxlint execution with 0 warnings.
3. JSDOM rendering of `App.jsx` with memory router across all 7 routes, spying on `console.error` and `console.warn`.
4. FireEvent simulation of invalid form submissions on `Setup.jsx`.

---

## 8. Milestone Decomposition & Implementation Directives

Based on these findings, here is the concrete specification for each milestone in the project:

### Milestone 1 (M1): Layout, Core Navigation & Mobile Drawer
1. **Fix `Sidebar.jsx`**:
   - Repair string literal syntax on line 23 to eliminate Oxlint warning and enable active navigation styling.
   - Support mobile drawer state.
2. **Upgrade `Topbar.jsx`**:
   - Add hamburger toggle button visible on mobile (`md:hidden`).
   - Add accessible labels (`aria-label="Open menu"`).
3. **Enhance `Layout.jsx`**:
   - Manage drawer state (`mobileMenuOpen`), provide overlay backdrop with smooth slide-in transition.
4. **Register all 7 routes in `App.jsx`**:
   - `/` -> `Landing`
   - `/setup` -> `Setup`
   - `/dashboard` -> `Dashboard`
   - `/assets` -> `FinancialInventory`
   - `/actions` -> `ActionCenter`
   - `/documents` -> `Documents`
   - `/timeline` -> `Timeline`
5. **Configure Tailwind & Fonts**:
   - Add Inter preconnect in `index.html`.
   - Update `tailwind.config.js` to extend `fontFamily.sans` with `Inter`.
   - Add extended slate/fintech color tokens.

### Milestone 2 (M2): Landing Page & Hero Section
1. Incorporate `src/assets/hero.png` into `Landing.jsx` with a responsive grid.
2. Retain tagline `"Bringing clarity to financial closure."`.
3. Provide primary CTA ("Start a Closure Case" -> `/setup`) and secondary CTA ("Explore Demo Dashboard" -> `/dashboard`).
4. Polish 5-step process cards with Lucide icons (`FilePlus`, `LayoutGrid`, `ListTodo`, `FileText`, `CheckCircle2`).

### Milestone 3 (M3): Setup Form Validation & Navigation Blocking
1. Update `Setup.jsx` with fields: `deceasedName`, `executorName`, `dateOfDeath`, `relationship` (dropdown), `pan` (masked/regex), `accountCount`.
2. Implement validation functions:
   - Trimmed name length $\ge 2$.
   - Valid past date (date $\le$ today).
   - Relationship selected from enumerated dropdown options.
   - PAN regex `^([A-Z]{5}[0-9]{4}[A-Z]|XXXXX[0-9]{4}[A-Z])$`.
   - Integer account count $\ge 0$.
3. Implement inline error messages beneath each input with urgent color (`#DC2626`).
4. Prevent form submission and navigation to `/dashboard` when any field is invalid.
5. On valid submit, update `AppContext` via `updateCaseData` and route to `/dashboard`.

### Milestone 4 (M4): Dashboard & Recharts Polish
1. Ensure Recharts `ResponsiveContainer` has explicit min-height to prevent resize warnings.
2. Bind summary cards to dynamic `AppContext` calculations.
3. Polish Needs Attention list with action badges and status indicators.

### Milestone 5 (M5): Estate Module Placeholder Pages
1. Implement `FinancialInventory.jsx`, `ActionCenter.jsx`, `Documents.jsx`, `Timeline.jsx`.
2. Include clear placeholder headings and badge ("Module Preview / Placeholder").
3. Bind each page to its corresponding mock data array from `AppContext`.
4. Provide realistic, dignified mock controls (e.g. status toggles, upload zones, filter tabs).

---

## 9. Conclusion
The requirements R1-R4 and acceptance criteria AC1-AC8 are fully specified and achievable with zero additional third-party dependencies. The primary engineering tasks are:
1. Implementing the mobile drawer in `Layout.jsx` / `Topbar.jsx` / `Sidebar.jsx`.
2. Adding robust validation, regex checking, and navigation blocking to `Setup.jsx`.
3. Creating the 4 missing module placeholder pages and mapping them in `App.jsx`.
4. Cleaning up Oxlint warnings in `Sidebar.jsx` and `AppContext.jsx`.
5. Verifying against the automated verification suite.
