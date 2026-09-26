# Handoff Report: Data Models, Mock Data & State Architecture Survey
**Track**: Explorer 2 (Survey & Data Architecture)  
**Parent Agent ID**: `698639a4-16da-4a5c-928f-2e44ffb94633`  
**Working Directory**: `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_2`  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

Direct code observations from `C:\Users\offic\.gemini\antigravity\scratch\aasra`:

1. **Intake Form Disconnect in `src/pages/Setup.jsx` (Lines 18–22)**:
   ```javascript
   const handleSubmit = (e) => {
     e.preventDefault();
     // In a real app, we would save data via a service. For now just navigate.
     navigate('/dashboard');
   };
   ```
   *Finding*: The form gathers `deceasedName`, `dateOfDeath`, `relationship`, `pan`, and `accountCount` in component local state, but does not dispatch them to `AppContext`. On submit, all entered data is lost and `/dashboard` displays hardcoded mock values.

2. **Missing Routes in `src/App.jsx` (Lines 13–18)**:
   ```jsx
   <Routes>
     <Route path="/" element={<Landing />} />
     <Route path="/setup" element={<Setup />} />
     <Route path="/dashboard" element={<Dashboard />} />
     <Route path="*" element={<Navigate to="/" replace />} />
   </Routes>
   ```
   *Finding*: The routes `/assets`, `/actions`, `/documents`, and `/timeline` mandated by **R1** and **R3** are completely missing. Any navigation attempt to these paths hits the wildcard route and redirects to `/`.

3. **Sidebar Route Mappings & String Interpolation Bug in `src/components/layout/Sidebar.jsx`**:
   - Lines 5–11:
     ```javascript
     const navItems = [
       { to: '/', label: 'Overview', icon: Home },
       { to: '/assets', label: 'Financial Inventory', icon: LayoutGrid },
       { to: '/actions', label: 'Action Center', icon: ListTodo },
       { to: '/documents', label: 'Documents', icon: FileText },
       { to: '/timeline', label: 'Timeline', icon: Clock },
     ];
     ```
     `'Overview'` navigates to the public marketing page (`/`) rather than the active case overview (`/dashboard`).
   - Lines 23–25:
     ```jsx
     className={({ isActive }) =>
       `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 " +
       (isActive ? 'bg-gray-100 font-medium' : '')`
     }
     ```
     Syntax error: contains literal `" + (isActive ...)` inside a backtick template literal, resulting in corrupted class names in the DOM.

4. **Flawed Closure Progress Calculation in `src/pages/Dashboard.jsx` (Line 19)**:
   ```javascript
   const closureProgress = Math.round(((totalAssets - totalLiabilities) / (totalAssets || 1)) * 100);
   ```
   *Finding*: This formula computes the net equity percentage of gross assets (e.g. ₹11.2L assets vs ₹1.2L loan yields 89%), completely misrepresenting closure task progress. Real estate closure progress must track completed actions/milestones (e.g., `(completedActions / totalActions) * 100`).

5. **Inadequate State Architecture in `src/context/AppContext.jsx` (Lines 7–39)**:
   - Does not provide a `updateCaseData` function to receive user input from `Setup.jsx`.
   - Lacks `localStorage` persistence, causing state to reset upon page refresh.
   - Provides no mutation helpers for adding assets, uploading documents, or toggling task completion.

---

## 2. Logic Chain

1. **From Observation 1**: Because `Setup.jsx` never invokes an `AppContext` updater, user input during the intake flow has zero effect on the application state. When the user completes the setup wizard and lands on `/dashboard`, none of the deceased or executor information reflects their input.
2. **From Observation 2 & 3**: Because `App.jsx` registers only 3 routes, 4 out of the 5 sidebar navigation links (`/assets`, `/actions`, `/documents`, `/timeline`) trigger immediate redirection back to `/` (Landing page). This breaks AC1, AC5, and R1. Additionally, the `'Overview'` nav item sends the user back to the Landing page rather than keeping them in the dashboard context.
3. **From Observation 3 (Syntax)**: Because `Sidebar.jsx` contains unescaped string concatenation inside backticks, navigation links do not receive proper active styling and pollute HTML attributes with string artifacts.
4. **From Observation 4**: Because `Dashboard.jsx` uses a financial solvency formula instead of a task/claims completion formula, an executor with 0 out of 4 tasks completed sees "89% Closure Progress", creating severe operational confusion.
5. **From Observation 5**: Because `AppContext.jsx` is transient and lacks comprehensive state actions, implementing interactive features across the 7 required pages requires refactoring the context provider with persistence and robust action dispatchers.
6. **From Requirements Synthesis**: To deliver a realistic, authentic Indian estate closure experience satisfying R1–R4 and AC1–AC8, comprehensive schemas for `CaseProfile`, `AssetItem`, `ActionItem`, `DocumentItem`, and `TimelineMilestone` have been formulated and documented in `survey_data_state.md`.

---

## 3. Caveats

1. **Read-Only Scope**: In adherence to explorer role constraints, no source files in `src/` were edited. All proposals are presented as specifications and drop-in code snippets in `survey_data_state.md`.
2. **Command Execution Limitation**: `run_command` permission prompts timed out in the headless environment, so build and lint verification were deferred to Explorer 1 and the implementation phase.
3. **Styling & Validation Details**: Visual CSS tokens (Fintech palette) and regex validation details are surveyed in parallel by Explorer 3 (`survey_design_verification.md`).

---

## 4. Conclusion

The data requirements and state architecture for Aasra have been comprehensively specified:
1. **Authoritative Schemas**: Complete data models defined for Case Profile, Assets (7 Indian financial categories), Action Checklist items (with stages and document requirements), Document Vault items (with verification states), and Timeline Milestones.
2. **Enhanced Mock Dataset**: A realistic, 8-asset, 6-action, 6-document dataset modeled around an authentic Indian estate closure case (Rahul Sharma / Aarav Sharma, LIC, EPFO, HDFC Bank, Zerodha, SBI MF).
3. **Target State Architecture**: A complete, drop-in `AppContext.jsx` design featuring `localStorage` persistence, case updating, action toggling, asset addition, document registration, and pre-calculated dashboard metrics.
4. **Actionable Roadmap**: Clear fixes documented for `App.jsx` routing, `Sidebar.jsx` navigation and template syntax, and `Dashboard.jsx` progress computation.

Full detailed report is saved at:
`C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_2\survey_data_state.md`

---

## 5. Verification Method

1. **Verify Report Existence & Completeness**:
   - Inspect `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_2\survey_data_state.md` to ensure all 7 sections (Executive Summary, Current State Assessment, Route Specifications, Authoritative Data Models, Mock Dataset, Target Context Provider, and Roadmap) are populated.
2. **Verify Codebase Deficiencies Cited**:
   - Inspect `src/pages/Setup.jsx` at line 18: verify `handleSubmit` lacks context update call.
   - Inspect `src/App.jsx` at line 13: verify `/assets`, `/actions`, `/documents`, `/timeline` routes are absent.
   - Inspect `src/components/layout/Sidebar.jsx` at line 23: verify template string concatenation error.
   - Inspect `src/pages/Dashboard.jsx` at line 19: verify `closureProgress` formula.
3. **Downstream Implementation Verification**:
   - Once implementer applies the `AppContext.jsx` and `mockData.js` updates:
     - Navigate to `/setup`, enter custom deceased name and PAN, submit.
     - Verify `/dashboard` reflects the entered deceased name.
     - Click each sidebar link (`/dashboard`, `/assets`, `/actions`, `/documents`, `/timeline`) and verify each page renders without redirection or console errors.
     - Toggle an action item in Action Center and verify closure progress on Dashboard dynamically recalculates.
