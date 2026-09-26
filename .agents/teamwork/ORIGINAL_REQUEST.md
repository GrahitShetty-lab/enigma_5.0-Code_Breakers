# Original User Request

## 2026-09-26T05:42:03Z

# Teamwork Project Prompt — Draft

> Status: Step 2 — Defining requirements and acceptance criteria
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: full build team (UI implementation)

**Project description**: Build the full Aasra Digital Estate Closure Assistant frontend with polished, responsive fintech‑style UI, using React, Tailwind CSS, React Router, mock data, and basic form validation.

Working directory: C:/Users/offic/.gemini/antigravity/scratch/aasra

## Requirements

### R1. Complete UI implementation
Create the following pages with the approved design language and navigation:
- Landing / Overview
- Setup / Start Closure Case (with required field validation)
- Dashboard / Overview
- Financial Inventory
- Action Center
- Documents
- Timeline (simple vertical list with icons and dates)
All pages must be reachable via React Router and share a common layout (sidebar + topbar). Use the existing mock data and React Context for state.

### R2. Form validation
The Setup page must enforce basic validation: non‑empty name, valid date format, selected relationship, and masked PAN field must follow a simple regex pattern. Show inline error messages.

### R3. Placeholder pages for future sections
Create simple placeholder components for any sidebar links that are not yet implemented (Assets, Actions, Documents, Timeline) with a heading indicating the page is a placeholder.

### R4. Visual design compliance
Apply the approved Aasra color palette, Inter typography, and spacing. Ensure the UI is responsive on mobile, tablet, and desktop, with the custom hamburger slide‑out drawer for navigation on smaller screens.

## Acceptance Criteria

- **AC1**: All listed routes load without console errors (automated verification script checks for any `console.error` or `console.warn` output).
- **AC2**: Landing page displays the hero section, tagline, CTA buttons, and workflow explanation as per design.
- **AC3**: Setup form validates required fields and prevents navigation to Dashboard until the form is correctly filled.
- **AC4**: Dashboard shows summary cards, needs‑attention list, and a Recharts pie chart with mock data.
- **AC5**: Financial Inventory, Action Center, Documents, and Timeline pages render correctly with placeholder headings where data is not yet populated.
- **AC6**: The layout (sidebar + topbar) works on desktop and collapses to a hamburger drawer on mobile, with navigation links functional.
- **AC7**: All pages are styled with the specified fintech color scheme and use the Inter font.
- **AC8**: The application builds and runs (`npm run dev`) with no TypeScript or runtime errors.

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*
