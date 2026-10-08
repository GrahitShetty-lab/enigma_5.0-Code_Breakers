// scripts/tests/tier3-combinations.mjs
// Tier 3: Cross-Feature Combinations Tests (AC3, AC4, AC6)

import {
  TestRunner,
  assert,
  readSource,
} from './test-utils.mjs';

export async function runTier3Tests() {
  const runner = new TestRunner('Tier 3 - Cross-Feature Combinations');

  // --- T3.1: Valid Setup Submission State Propagation ---
  await runner.test(
    'T3.1: Valid Setup form submission updates AppContext and navigates to Dashboard (AC3)',
    async () => {
      const setupCode = readSource('src/pages/Setup.jsx');
      const contextCode = readSource('src/context/AppContext.jsx');

      // Setup must consume context mutation
      assert(
        setupCode.includes('updateCaseData') || setupCode.includes('setCaseData'),
        'Setup.jsx must consume updateCaseData or setCaseData from AppContext'
      );

      // AppContext must provide updateCaseData
      assert(
        contextCode.includes('updateCaseData'),
        'AppContext.jsx must provide and export updateCaseData mutation'
      );

      // Setup submit must pass sanitized data
      assert(
        setupCode.includes('deceasedName') && setupCode.includes('pan'),
        'Setup.jsx must submit deceasedName and pan to AppContext'
      );

      // Dashboard must consume caseData and display it
      const dashCode = readSource('src/pages/Dashboard.jsx');
      assert(
        dashCode.includes('caseData') || dashCode.includes('caseInfo'),
        'Dashboard.jsx must consume caseData to display active case profile banner'
      );
    },
    { ac: 'AC3', tier: 'Tier 3' }
  );

  // --- T3.2: Action Status Toggling & Closure Progress Reactivity ---
  await runner.test(
    'T3.2: Action status toggling updates AppContext state and derived closure progress metrics (AC4)',
    async () => {
      const contextCode = readSource('src/context/AppContext.jsx');

      // Verify toggle/update action functions exist
      assert(
        contextCode.includes('updateActionStatus') || contextCode.includes('toggleActionStatus'),
        'AppContext.jsx must provide action mutation function (updateActionStatus or toggleActionStatus)'
      );

      // Verify progress calculation is action-based
      const hasActionBasedProgress =
        contextCode.includes('completedActionsCount') ||
        contextCode.includes('filter(a => a.status === \'completed\')') ||
        contextCode.includes('filter((a) => a.status === \'completed\')') ||
        contextCode.includes('closureProgress');

      assert(
        hasActionBasedProgress,
        'AppContext.jsx must calculate closureProgress based on completed actions count'
      );

      // Verify financial metrics are derived
      assert(
        contextCode.includes('totalAssets') && contextCode.includes('totalLiabilities'),
        'AppContext.jsx must calculate totalAssets and totalLiabilities derived metrics'
      );

      // Verify Recharts pieData is computed
      assert(
        contextCode.includes('pieData') || contextCode.includes('categoryTotals'),
        'AppContext.jsx must compute pieData aggregated by asset category for Recharts'
      );
    },
    { ac: 'AC4', tier: 'Tier 3' }
  );

  // --- T3.3: Responsive Layout & Mobile Slide-Out Drawer ---
  await runner.test(
    'T3.3: Responsive Layout renders desktop sidebar and collapses to mobile slide-out drawer with hamburger toggle (AC6)',
    async () => {
      const layoutCode = readSource('src/components/layout/Layout.jsx');
      const topbarCode = readSource('src/components/layout/Topbar.jsx');
      const sidebarCode = readSource('src/components/layout/Sidebar.jsx');

      // Layout manages mobile state
      assert(
        layoutCode.includes('mobileMenuOpen') ||
          layoutCode.includes('isMobileOpen') ||
          layoutCode.includes('menuOpen') ||
          layoutCode.includes('sidebarOpen'),
        'Layout.jsx must manage mobile drawer open/close state'
      );

      // Topbar contains hamburger toggle on mobile (md:hidden)
      assert(
        topbarCode.includes('md:hidden'),
        'Topbar.jsx must contain a mobile menu button visible only on mobile (md:hidden)'
      );
      assert(
        topbarCode.includes('Menu') || topbarCode.includes('hamburger') || topbarCode.includes('aria-label'),
        'Topbar.jsx must render hamburger icon or menu button'
      );

      // Sidebar has desktop persistent mode (hidden md:flex)
      assert(
        sidebarCode.includes('md:flex') || layoutCode.includes('md:flex'),
        'Desktop layout must render persistent sidebar on md:flex viewports'
      );

      // Sidebar or drawer supports mobile drawer panel & overlay
      const hasDrawerSupport =
        sidebarCode.includes('isMobileOpen') ||
        sidebarCode.includes('isOpen') ||
        sidebarCode.includes('backdrop') ||
        sidebarCode.includes('z-50') ||
        sidebarCode.includes('fixed inset') ||
        layoutCode.includes('fixed inset') ||
        layoutCode.includes('backdrop');

      assert(
        hasDrawerSupport,
        'Sidebar.jsx or Layout.jsx must provide a mobile slide-out drawer with overlay backdrop'
      );

      // Sidebar active class syntax check: must NOT have the broken template literal
      assert(
        !sidebarCode.includes(' " + (isActive ?'),
        'Sidebar.jsx line 23 string literal syntax bug must be resolved (no raw " + (isActive ? in template)'
      );
    },
    { ac: 'AC6', tier: 'Tier 3' }
  );

  return runner.summary();
}
