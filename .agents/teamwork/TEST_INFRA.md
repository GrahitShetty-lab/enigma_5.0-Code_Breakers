# Test Infrastructure & Verification Architecture: Aasra Digital Estate Closure Assistant

**Project**: Aasra Digital Estate Closure Assistant  
**Author**: E2E Test Writer (`test_writer_e2e`)  
**Target Repository**: `C:\Users\offic\.gemini\antigravity\scratch\aasra`  
**Test Suite Path**: `scripts/verify-e2e.mjs`  
**Authoritative References**: `ORIGINAL_REQUEST.md` (R1-R4, AC1-AC8), `PROJECT.md`, `survey_design_verification.md`

---

## 1. Executive Summary & Verification Strategy

The Aasra Digital Estate Closure Assistant test infrastructure is built upon an automated, multi-tiered opaque-box test runner designed to verify end-to-end user journeys, functional constraints, form validation barriers, visual design tokens, and build integrity without external browser binary overhead.

### Key Highlights
- **Zero-Dependency Native ESM Execution**: Built with standard Node.js ESM modules (`node:fs`, `node:path`, `node:url`), executing reliably on any developer machine or CI pipeline with `node scripts/verify-e2e.mjs`.
- **4-Tier Verification Hierarchy**:
  - **Tier 1 (Feature Coverage)**: Validates all 7 route registrations, Landing hero & CTAs, Setup input controls, Dashboard analytics & Recharts components, and module placeholder headings.
  - **Tier 2 (Boundary & Corner Cases)**: Validates form input rejections (empty strings, whitespace, future dates, unselected relationships), authoritative PAN regex patterns (`XXXXX1234X` & `ABCDE1234F` vs 13 invalid variations), and the navigation barrier.
  - **Tier 3 (Cross-Feature Combinations)**: Validates state updates propagating from Setup into `AppContext` and Dashboard, action status toggling updating closure progress dynamically, and mobile drawer transitions.
  - **Tier 4 (Real-World Application Scenario)**: Exercises an end-to-end Indian estate closure workflow from onboarding through case creation, asset inspection, action resolution, and audit review.
  - **System Integrity (AC1, AC7, AC8)**: Real-time console log interception (0 errors, 0 warnings), fintech palette token and Inter font inspection, and build/lint verification.

---

## 2. Directory Layout & Test Suite Structure

```
aasra/
├── scripts/
│   ├── verify-e2e.mjs                 # Master CLI Test Runner & Scorecard Generator
│   └── tests/
│       ├── test-utils.mjs             # Shared assertion helpers, colors, & validation engines
│       ├── tier1-features.mjs         # Tier 1: Feature Coverage (AC1, AC2, AC3, AC4, AC5)
│       ├── tier2-boundaries.mjs       # Tier 2: Boundary & Corner Cases (AC3, R2)
│       ├── tier3-combinations.mjs     # Tier 3: Cross-Feature Combinations (AC3, AC4, AC6)
│       ├── tier4-scenarios.mjs        # Tier 4: Real-World End-to-End Intake Scenario
│       └── system-integrity.mjs       # System Integrity: AC1, AC7, AC8
├── src/                               # Application source code
├── dist/                              # Production build artifacts
├── .agents/teamwork/
│   ├── TEST_INFRA.md                  # This document
│   └── TEST_READY.md                  # Test Readiness Publication
└── package.json
```

---

## 3. Acceptance Criteria Mapping Matrix

| Acceptance Criteria | Description | Primary Test Location | Key Assertions |
|---|---|---|---|
| **AC1** | All 7 routes load cleanly with zero `console.error` and zero `console.warn` | `tier1-features.mjs` (T1.1), `system-integrity.mjs` | Routes `/`, `/setup`, `/dashboard`, `/assets`, `/actions`, `/documents`, `/timeline` defined; 0 console errors; 0 console warnings |
| **AC2** | Landing page hero, tagline, CTAs, 5-step workflow | `tier1-features.mjs` (T1.2) | Exact tagline `"Bringing clarity to financial closure."`, `hero.png` asset rendering, CTAs to `/setup` and `/dashboard`, 5 workflow steps present |
| **AC3** | Setup form validation & navigation barrier | `tier1-features.mjs` (T1.3), `tier2-boundaries.mjs` (T2.1-T2.6), `tier3-combinations.mjs` (T3.1) | Name length $\ge 2$, date $\le$ today, relationship dropdown, PAN regex `/^([A-Z]{5}[0-9]{4}[A-Z]\|XXXXX[0-9]{4}[A-Z])$/i`, navigation barrier halts on invalid input |
| **AC4** | Dashboard summary cards, attention list, Recharts pie chart | `tier1-features.mjs` (T1.4), `tier3-combinations.mjs` (T3.2) | 4 cards (Total Assets, Liabilities, Pending Actions, Progress %), Needs Attention list, Recharts `PieChart`, `Pie`, `Cell` components |
| **AC5** | Placeholder headings on `/assets`, `/actions`, `/documents`, `/timeline` | `tier1-features.mjs` (T1.5) | Headings: "Financial Inventory", "Action Center", "Document Vault", "Closure Milestones Timeline" with "Module Preview" / "Placeholder" badges |
| **AC6** | Responsive layout: desktop sidebar vs mobile slide-out drawer | `tier3-combinations.mjs` (T3.3) | Desktop sidebar (`hidden md:flex`), mobile hamburger button (`md:hidden`) in Topbar, drawer slide-out panel, backdrop overlay, drawer auto-close |
| **AC7** | Fintech color palette and Inter typography | `system-integrity.mjs` | `tailwind.config.js` sans Inter, semantic tokens (`primary`, `success`, `pending`, `urgent`), `index.html` font preconnects |
| **AC8** | Clean build and lint pass | `system-integrity.mjs` | `dist/index.html` production build verification, `package.json` scripts |

---

## 4. Test Execution Guide

### 4.1 Running the Complete Suite
Run the test runner from the project root directory:
```bash
node scripts/verify-e2e.mjs
```

### 4.2 Filtering by Tier
Run only specific test tiers during targeted development:
```bash
# Run Tier 1 only (Feature Coverage)
node scripts/verify-e2e.mjs --tier=1

# Run Tier 2 only (Form Boundaries & Regex)
node scripts/verify-e2e.mjs --tier=2

# Run Tier 3 only (Cross-Feature State & Drawer)
node scripts/verify-e2e.mjs --tier=3

# Run Tier 4 only (End-to-End Scenario)
node scripts/verify-e2e.mjs --tier=4
```

### 4.3 Machine-Readable Output (CI/CD Integration)
Output structured JSON containing full scorecard metrics, timing, and error traces:
```bash
node scripts/verify-e2e.mjs --json
```

---

## 5. Console Integrity & Error Trapping Protocol (AC1)

The test runner utilizes a custom `ConsoleInterceptor` harness that wraps `console.error` and `console.warn` at runtime:
- Any call to `console.error` records the timestamp, caller arguments, and stack trace.
- Any call to `console.warn` records the warning message.
- At the end of execution, `consoleLogs.errorCount` and `consoleLogs.warningCount` are tallied.
- If either count is $> 0$, the suite automatically fails AC1 and exits with status code `1`.

---

## 6. QA Escalation Protocol

As an E2E Test Writer under QA protocol:
1. **Separation of Concerns**: Test code is strictly isolated in `scripts/`. No application implementation code is altered by the Test Writer.
2. **Defect Escalation**: When tests fail due to implementation gaps or defects in `src/`, defects are categorized by Acceptance Criteria and reported to the implementing agent (`worker_impl_1`) or orchestrator.
3. **Re-Verification**: Once the implementing agent commits fixes, the test suite is re-executed to confirm resolution with 100% compliance.
