# Dispatch: E2E Test Writer (Testing Track)

## Mission
Design and implement a comprehensive, opaque-box E2E test suite and automated verification runner for the Aasra Digital Estate Closure Assistant project derived strictly from user requirements (R1-R4, AC1-AC8).

## Working Directory
`C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\test_writer_e2e`

## Authoritative Inputs
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\ORIGINAL_REQUEST.md`
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\orchestrator\PROJECT.md`
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_3\survey_design_verification.md`

## Write Ownership
- `scripts/verify-e2e.mjs` (and any auxiliary test runners/scripts)
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\TEST_INFRA.md`
- `C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\TEST_READY.md`

## Scope & Methodology (4 Tiers)
1. **Tier 1 - Feature Coverage**:
   - Verify all 7 routes load cleanly: `/`, `/setup`, `/dashboard`, `/assets`, `/actions`, `/documents`, `/timeline`.
   - Verify Landing page elements (title, tagline, CTAs, 5-step cards).
   - Verify Setup form elements (names, date, relationship, PAN, accounts, submit button).
   - Verify Dashboard metrics and Recharts pie chart.
   - Verify placeholder headings on `/assets`, `/actions`, `/documents`, `/timeline`.
2. **Tier 2 - Boundary & Corner Cases**:
   - Form validation: empty inputs rejection.
   - Future date rejection.
   - Unselected relationship rejection.
   - Masked PAN regex testing (`XXXXX1234X`, full PAN `ABCDE1234F`, invalid string rejection).
   - Navigation barrier: assert `/dashboard` is NOT navigated to when form is invalid.
3. **Tier 3 - Cross-Feature Combinations**:
   - Valid Setup submission updates AppContext and allows navigation to `/dashboard`.
   - Action status toggling updates Dashboard closure progress.
   - Mobile hamburger drawer open/close behavior.
4. **Tier 4 - Real-World Application Scenario**:
   - End-to-end estate intake flow: Landing -> Setup (fill valid Indian estate case) -> Dashboard -> inspect Assets -> complete task in Action Center -> inspect updated progress.
5. **Console Integrity (AC1)**:
   - Automated check capturing all `console.error` and `console.warn` outputs during route transitions; assert 0 errors and 0 warnings.
6. **Build Integrity (AC8)**:
   - Run `npm run build` and `npm run lint` and assert clean exit code 0.

Publish `TEST_INFRA.md` and `TEST_READY.md` upon completion and write `handoff.md`.

## 2026-09-26T05:51:08Z
<USER_REQUEST>
You are the E2E Test Writer for the Aasra Digital Estate Closure Assistant project.
Your working directory is: C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\test_writer_e2e
Read your task assignment from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\test_writer_e2e\DISPATCH.md
Read the authoritative requirements from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture and milestone index from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\orchestrator\PROJECT.md
Read the verification specifications from C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\explorer_survey_3\survey_design_verification.md

Your mission:
1. Design and implement the opaque-box test runner and test suite (Tiers 1-4) in scripts/verify-e2e.mjs (or related test scripts) verifying:
   - AC1: All 7 routes load cleanly with zero console.error and zero console.warn.
   - AC2: Landing page hero, tagline, CTAs, workflow explanation.
   - AC3: Setup form validation: rejection of empty fields, future dates, unselected relationships, invalid PAN strings; regex matching of masked PAN XXXXX1234X and standard PAN; navigation barrier preventing access to /dashboard until valid.
   - AC4: Dashboard summary cards, needs-attention list, Recharts pie chart SVG.
   - AC5: Placeholder headings on /assets, /actions, /documents, /timeline.
   - AC6: Responsive layout: desktop sidebar vs mobile hamburger slide-out drawer navigation.
   - AC7: Fintech color palette and Inter typography.
   - AC8: Build and lint clean exit.
2. Create C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\TEST_INFRA.md using the template in the project pattern.
3. Publish C:\Users\offic\.gemini\antigravity\scratch\aasra\.agents\teamwork\TEST_READY.md when the suite is complete.
4. Write handoff.md in your working directory and notify parent via send_message.
</USER_REQUEST>
