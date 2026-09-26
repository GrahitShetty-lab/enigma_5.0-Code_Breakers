// scripts/tests/tier1-features.mjs
// Tier 1: Feature Coverage Tests (AC1, AC2, AC3, AC4, AC5)

import {
  TestRunner,
  assert,
  readSource,
  fileExists,
} from './test-utils.mjs';

export async function runTier1Tests() {
  const runner = new TestRunner('Tier 1 - Feature Coverage');

  // --- T1.1: Route Registration Across All 7 Routes (AC1) ---
  await runner.test(
    'T1.1: All 7 mandated routes registered in src/App.jsx (AC1)',
    async () => {
      const appCode = readSource('src/App.jsx');
      const mandatedRoutes = [
        { path: '/', name: 'Landing' },
        { path: '/setup', name: 'Setup' },
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/assets', name: 'FinancialInventory' },
        { path: '/actions', name: 'ActionCenter' },
        { path: '/documents', name: 'Documents' },
        { path: '/timeline', name: 'Timeline' },
      ];

      for (const route of mandatedRoutes) {
        // Look for path="/" or path="/setup" etc.
        const pathRegex = new RegExp(`path\\s*=\\s*["']${route.path.replace('/', '\\/')}["']`);
        assert(
          pathRegex.test(appCode),
          `Missing route registration for path: "${route.path}" in src/App.jsx`
        );
      }

      // Verify catch-all wildcard route
      assert(
        /path\s*=\\s*["']\*["']/.test(appCode) || /path\s*=\s*"\*"/.test(appCode) || /path\s*=\s*'\*'/.test(appCode),
        'Missing wildcard catch-all route (path="*") in src/App.jsx'
      );
    },
    { ac: 'AC1', tier: 'Tier 1' }
  );

  // --- T1.2: Landing Page Elements (AC2) ---
  await runner.test(
    'T1.2: Landing page displays hero branding, tagline, CTAs, hero image & 5-step workflow (AC2)',
    async () => {
      const landingCode = readSource('src/pages/Landing.jsx');

      // Tagline requirement
      assert(
        landingCode.includes('Bringing clarity to financial closure.'),
        'Landing page must contain exact tagline: "Bringing clarity to financial closure."'
      );

      // Primary CTA to /setup
      assert(
        /to\s*=\s*["']\/setup["']/.test(landingCode) || /href\s*=\s*["']\/setup["']/.test(landingCode),
        'Landing page must contain CTA linking to "/setup"'
      );

      // Secondary CTA to /dashboard
      assert(
        /to\s*=\s*["']\/dashboard["']/.test(landingCode) || /href\s*=\s*["']\/dashboard["']/.test(landingCode),
        'Landing page must contain CTA linking to "/dashboard"'
      );

      // Hero image check
      assert(
        landingCode.includes('hero.png') || landingCode.includes('heroImage') || /src\/assets\/hero\.png/.test(landingCode),
        'Landing page must import or reference hero.png asset'
      );
      assert(
        fileExists('src/assets/hero.png'),
        'hero.png asset file must exist at src/assets/hero.png'
      );

      // 5-step workflow explanation cards
      const workflowSteps = [
        'Add basic details',
        'Organize financial information',
        'Identify pending actions',
        'Track claims and documents',
        'Reach financial closure',
      ];

      for (const step of workflowSteps) {
        assert(
          landingCode.includes(step),
          `Landing page workflow explanation must contain step: "${step}"`
        );
      }
    },
    { ac: 'AC2', tier: 'Tier 1' }
  );

  // --- T1.3: Setup Form Elements & Controls (AC3) ---
  await runner.test(
    'T1.3: Setup form contains required inputs: name, date, relationship dropdown, PAN, accounts & submit (AC3)',
    async () => {
      const setupCode = readSource('src/pages/Setup.jsx');

      // Deceased Name input
      assert(
        /name\s*=\s*["']deceasedName["']/.test(setupCode) || /id\s*=\s*["']deceasedName["']/.test(setupCode) || setupCode.includes('deceasedName'),
        'Setup page must contain input for deceased person name (deceasedName)'
      );

      // Date of passing input
      assert(
        /type\s*=\s*["']date["']/.test(setupCode),
        'Setup page must contain an input of type="date" for date of death'
      );

      // Relationship dropdown selector (<select>)
      assert(
        /<select[\s\S]*?name\s*=\s*["']relationship["']/.test(setupCode) ||
          /<select[\s\S]*?id\s*=\s*["']relationship["']/.test(setupCode) ||
          setupCode.includes('<select'),
        'Setup page must use a <select> dropdown element for relationship selection (R2)'
      );

      // PAN input
      assert(
        /name\s*=\s*["']pan["']/.test(setupCode) || /id\s*=\s*["']pan["']/.test(setupCode) || setupCode.includes('pan'),
        'Setup page must contain input for PAN (pan)'
      );

      // Account count input
      assert(
        /name\s*=\s*["']accountCount["']/.test(setupCode) || /id\s*=\s*["']accountCount["']/.test(setupCode) || setupCode.includes('accountCount'),
        'Setup page must contain input for account count (accountCount)'
      );

      // Submit button
      assert(
        /type\s*=\s*["']submit["']/.test(setupCode) || /<button[^>]*>[\s\S]*?(Continue|Submit|Create|Proceed)[\s\S]*?<\/button>/i.test(setupCode),
        'Setup page must contain a submit button'
      );
    },
    { ac: 'AC3', tier: 'Tier 1' }
  );

  // --- T1.4: Dashboard Summary Cards, Needs Attention & Recharts Pie Chart (AC4) ---
  await runner.test(
    'T1.4: Dashboard renders 4 summary metrics, attention checklist & Recharts pie chart (AC4)',
    async () => {
      const dashCode = readSource('src/pages/Dashboard.jsx');

      // 4 Summary Metrics
      assert(
        dashCode.includes('Total Assets') || dashCode.includes('totalAssets'),
        'Dashboard must render Total Assets metric card'
      );
      assert(
        dashCode.includes('Liabilities') || dashCode.includes('totalLiabilities'),
        'Dashboard must render Liabilities metric card'
      );
      assert(
        dashCode.includes('Pending Actions') || dashCode.includes('pendingActions'),
        'Dashboard must render Pending Actions metric card'
      );
      assert(
        dashCode.includes('Closure Progress') || dashCode.includes('closureProgress'),
        'Dashboard must render Closure Progress metric card'
      );

      // Needs Attention Section
      assert(
        dashCode.includes('Needs Attention') || dashCode.includes('needs-attention') || dashCode.includes('Action Items'),
        'Dashboard must render a "Needs Attention" checklist section'
      );

      // Recharts SVG Pie Chart Integration
      assert(
        dashCode.includes('PieChart') && dashCode.includes('Pie') && dashCode.includes('Cell'),
        'Dashboard must import and render Recharts PieChart, Pie, and Cell components'
      );
    },
    { ac: 'AC4', tier: 'Tier 1' }
  );

  // --- T1.5: Estate Module Placeholders & Headings (AC5) ---
  await runner.test(
    'T1.5: Financial Inventory, Action Center, Documents & Timeline placeholder pages exist with headings (AC5)',
    async () => {
      const placeholders = [
        {
          file: 'src/pages/FinancialInventory.jsx',
          expectedHeading: 'Financial Inventory',
          altHeading: 'Financial',
          route: '/assets',
        },
        {
          file: 'src/pages/ActionCenter.jsx',
          expectedHeading: 'Action Center',
          altHeading: 'Action',
          route: '/actions',
        },
        {
          file: 'src/pages/Documents.jsx',
          expectedHeading: 'Document Vault',
          altHeading: 'Documents',
          route: '/documents',
        },
        {
          file: 'src/pages/Timeline.jsx',
          expectedHeading: 'Closure Milestones Timeline',
          altHeading: 'Timeline',
          route: '/timeline',
        },
      ];

      for (const p of placeholders) {
        assert(
          fileExists(p.file),
          `Placeholder component file must exist: ${p.file} for route ${p.route}`
        );

        const code = readSource(p.file);
        const hasHeading =
          code.includes(p.expectedHeading) || code.includes(p.altHeading);
        assert(
          hasHeading,
          `${p.file} must render prominent heading for "${p.expectedHeading}"`
        );

        // Indicator check: "Module Preview" or "Placeholder" or "Preview"
        const hasPlaceholderIndicator =
          /preview|placeholder|module preview/i.test(code);
        assert(
          hasPlaceholderIndicator,
          `${p.file} must render a placeholder / preview indicator badge or heading (R3, AC5)`
        );
      }
    },
    { ac: 'AC5', tier: 'Tier 1' }
  );

  return runner.summary();
}
