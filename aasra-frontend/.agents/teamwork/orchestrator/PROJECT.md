# Project: Aasra Digital Estate Closure Assistant

## Architecture
- **Framework & Runtime**: React 19, Vite (Rolldown bundler), Tailwind CSS v3, PostCSS, Oxlint.
- **Routing**: React Router v7 (`react-router-dom`) with client-side SPA routing across 7 routes:
  - `/` -> Landing / Onboarding Overview
  - `/setup` -> Case Setup & Intake Wizard
  - `/dashboard` -> Operational Case Overview & KPIs
  - `/assets` -> Financial Inventory (Estate Assets & Liabilities)
  - `/actions` -> Action Center (Task Checklist & Statutory Claims)
  - `/documents` -> Document Vault (Estate & Probate Records)
  - `/timeline` -> Milestones Timeline (Audit Trail & Activity Log)
- **Layout Architecture**:
  - Unified `Layout.jsx` wrapping application pages with `Sidebar` and `Topbar`.
  - Responsive navigation: Persistent desktop sidebar (`md:flex`), hidden on mobile (`md:hidden`).
  - Mobile slide-out drawer triggered via hamburger button in `Topbar` with dimmed backdrop overlay and auto-close on navigation.
- **State Management**:
  - React Context (`AppContext.jsx`) with `localStorage` synchronization.
  - Exposes state: `caseData`, `assetList`, `actionList`, `documentList`, `timelineList`.
  - Exposes mutations: `updateCaseData`, `updateActionStatus`, `toggleActionStatus`, `updateAssetStatus`, `addAsset`, `updateDocumentStatus`, `addDocument`, `resetToDefaults`.
  - Exposes derived metrics: `totalAssets`, `totalLiabilities`, `netEstateValue`, `totalActionsCount`, `completedActionsCount`, `pendingActionsCount`, `closureProgress`, `pieData`.
- **Design Tokens**:
  - Inter typography (`font-sans`), Fintech palette (Slate-50 canvas, Slate-900 text, Indigo-600 primary, Emerald-500 success, Amber-500 pending, Red-600 urgent).

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Global Layout & Theme | Common layout with sidebar + topbar, Inter font, fintech palette tokens | M1 | R1, R4, AC6, AC7 |
| 2 | Mobile Slide-out Drawer | Responsive hamburger toggle in topbar, slide-out drawer on `< md` viewports | M1 | R4, AC6 |
| 3 | Core Navigation & Route Setup | Register all 7 routes in App.jsx and fix Sidebar active styling & paths | M1 | R1, AC1 |
| 4 | State Management & Mock Data | AppContext with localStorage sync, case updates, action toggling, derived metrics, and realistic Indian estate mock dataset | M2 | R1, AC1, AC4 |
| 5 | Landing Page & Hero Section | Hero tagline, CTA buttons, hero.png image integration, 5-step workflow explanation cards | M3 | R1, AC2 |
| 6 | Setup Form Validation & Barrier | Required fields (names, date, relationship dropdown, PAN regex `^([A-Z]{5}[0-9]{4}[A-Z]\|XXXXX[0-9]{4}[A-Z])$`), inline error messages, navigation barrier to `/dashboard` | M4 | R1, R2, AC3 |
| 7 | Estate Module Placeholders | Financial Inventory (`/assets`), Action Center (`/actions`), Documents (`/documents`), Timeline (`/timeline`) with clear placeholder headings and active mock data | M5 | R1, R3, AC5 |
| 8 | Dashboard & Visual Analytics | Summary cards (Assets, Liabilities, Pending, Progress), Needs Attention list, Recharts category pie chart, active case profile banner | M6 | R1, AC4 |
| 9 | E2E Testing Suite & Zero Errors | Opaque-box automated verification covering all routes, console error/warn absence, build pass, full AC1-AC8 compliance | M7 | AC1-AC8 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Layout, Mobile Drawer & Routing | `Sidebar.jsx`, `Topbar.jsx`, `Layout.jsx`, `App.jsx`, `tailwind.config.js`, `index.html` | none | PLANNED |
| M2 | State Management & Mock Data | `mockData.js`, `AppContext.jsx` | none | PLANNED |
| M3 | Landing Page & Hero Section | `Landing.jsx`, `src/assets/hero.png` | M1 | PLANNED |
| M4 | Setup Form & Validation Barrier | `Setup.jsx` (validation, PAN regex, relationship dropdown, inline errors, block navigation) | M1, M2 | PLANNED |
| M5 | Estate Modules & Placeholders | `FinancialInventory.jsx`, `ActionCenter.jsx`, `Documents.jsx`, `Timeline.jsx` | M1, M2 | PLANNED |
| M6 | Dashboard & Visual Analytics | `Dashboard.jsx` (summary cards, Recharts pie chart, attention list, case banner) | M1, M2 | PLANNED |
| M7 | E2E Test Suite 100% Pass & Audit | Automated verification script (`verify-e2e.mjs`), AC1-AC8 verification, build & lint pass, final forensic audit | M1-M6 | PLANNED |

---

## Interface Contracts

### 1. `AppContext` ↔ Pages (`Setup`, `Dashboard`, `FinancialInventory`, `ActionCenter`, `Documents`, `Timeline`)
- **State Values**:
  - `caseData`: `{ id, deceasedName, dateOfDeath, relationship, executorName, pan, accountCount, caseStatus }`
  - `assetList`: Array of `{ id, institution, category, type, accountNumberMasked, value, nomineeStatus, nomineeName, status, notes }`
  - `actionList`: Array of `{ id, title, description, institution, category, priority, dueDate, status, stage, assetId, requiredDocIds }`
  - `documentList`: Array of `{ id, name, documentType, category, fileSize, uploadDate, status, isRequired }`
  - `timelineList`: Array of `{ id, title, description, date, status, category, actor, icon }`
- **Mutations**:
  - `updateCaseData(fields: Partial<CaseProfile>): void`
  - `updateActionStatus(id: string, status: 'needs' | 'in-progress' | 'completed'): void`
  - `toggleActionStatus(id: string): void`
  - `updateAssetStatus(id: string, status: string): void`
  - `addAsset(asset: AssetItem): void`
  - `updateDocumentStatus(id: string, status: string): void`
  - `addDocument(doc: DocumentItem): void`
  - `resetToDefaults(): void`
- **Computed Metrics**:
  - `totalAssets`: `number` (gross INR excluding liabilities & subscriptions)
  - `totalLiabilities`: `number` (gross INR liabilities)
  - `netEstateValue`: `number` (`totalAssets - totalLiabilities`)
  - `totalActionsCount`: `number`
  - `completedActionsCount`: `number`
  - `pendingActionsCount`: `number`
  - `closureProgress`: `number` (integer percentage 0-100 based on actions completed)
  - `pieData`: Array of `{ name: string, value: number }` categorized by asset category

### 2. `Layout` ↔ `Topbar` ↔ `Sidebar`
- `Layout` maintains `mobileMenuOpen: boolean`.
- `Topbar` accepts:
  - `onToggleMobileMenu: () => void`
  - `isOpen: boolean`
- `Sidebar` accepts:
  - `isMobileOpen: boolean`
  - `onCloseMobile: () => void`
- Navigation item click on mobile invokes `onCloseMobile()`.

### 3. Setup Page Form Validation Contract
- `deceasedName`: trimmed string length $\ge 2$.
- `dateOfDeath`: valid date $\le$ today.
- `relationship`: one of `["Spouse", "Son", "Daughter", "Parent", "Sibling", "Legal Heir", "Other"]`.
- `pan`: Regex `/^([A-Z]{5}[0-9]{4}[A-Z]|XXXXX[0-9]{4}[A-Z])$/i`.
- `accountCount`: integer $\ge 0$.
- Inline error display: `<p className="mt-1 text-xs text-urgent font-medium">`.
- Submit behavior: if errors exist, prevent navigation and highlight fields; if valid, call `updateCaseData(...)` and `navigate('/dashboard')`.

---

## Code Layout

- `src/`
  - `assets/hero.png` (Landing hero illustration)
  - `components/layout/`
    - `Layout.jsx` (App shell with desktop sidebar + mobile drawer)
    - `Sidebar.jsx` (Navigation items with active styles and mobile drawer panel)
    - `Topbar.jsx` (Header with logo, title, notification bell, and mobile hamburger button)
  - `context/`
    - `AppContext.jsx` (Centralized estate closure state, localStorage, derived metrics)
  - `data/`
    - `mockData.js` (Indian estate closure mock records: caseInfo, assets, actions, documents, timeline)
  - `pages/`
    - `Landing.jsx` (Marketing overview, hero with hero.png, CTAs, 5-step process)
    - `Setup.jsx` (Case intake form with strict inline validation & barrier)
    - `Dashboard.jsx` (Case overview, KPI cards, Recharts pie chart, attention list)
    - `FinancialInventory.jsx` (Asset catalog with category tabs, values in ₹, status badges)
    - `ActionCenter.jsx` (Checklist with priority chips, due dates, interactive toggles)
    - `Documents.jsx` (Document vault with categories, file sizes, verification status)
    - `Timeline.jsx` (Vertical milestone timeline with status icons and dates)
  - `App.jsx` (React Router definitions across all 7 routes)
  - `index.css` (Tailwind directives, Inter typography)
- `scripts/`
  - `verify-e2e.mjs` (Automated verification script validating AC1-AC8, route loads, clean console, form barrier, and build)
