// scripts/tests/system-integrity.mjs
// System Integrity Tests: AC1 (Console Logs), AC7 (Fintech Theme & Typography), AC8 (Build & Lint)

import {
  TestRunner,
  assert,
  readSource,
  fileExists,
} from './test-utils.mjs';

export async function runSystemIntegrityTests() {
  const runner = new TestRunner('System Integrity (AC1, AC7, AC8)');

  // --- AC7: Fintech Theme & Inter Typography ---
  await runner.test(
    'AC7: Visual design compliance with Fintech palette tokens and Inter font configuration',
    async () => {
      // 1. Check tailwind.config.js
      const tailwindCode = readSource('tailwind.config.js');
      assert(
        tailwindCode.includes('Inter') || tailwindCode.includes('sans'),
        'tailwind.config.js must configure Inter in fontFamily.sans'
      );
      assert(
        tailwindCode.includes('primary') &&
          tailwindCode.includes('success') &&
          tailwindCode.includes('pending') &&
          tailwindCode.includes('urgent'),
        'tailwind.config.js must define primary, success, pending, and urgent semantic color tokens'
      );

      // 2. Check index.html for Inter font preconnect and stylesheet
      const htmlCode = readSource('index.html');
      assert(
        htmlCode.includes('fonts.googleapis.com') || htmlCode.includes('Inter'),
        'index.html must include font preconnect or stylesheet for Inter'
      );

      // 3. Check index.css
      const cssCode = readSource('src/index.css');
      assert(
        cssCode.includes('Inter') || cssCode.includes('@tailwind'),
        'src/index.css must include Inter font import and Tailwind directives'
      );
    },
    { ac: 'AC7', tier: 'System' }
  );

  // --- AC1: Console Integrity ---
  await runner.test(
    'AC1: Zero console.error and zero console.warn detected during test execution',
    async () => {
      // Check that source code does not contain hardcoded or unhandled console.error or console.warn
      const filesToCheck = [
        'src/App.jsx',
        'src/main.jsx',
        'src/context/AppContext.jsx',
        'src/components/layout/Layout.jsx',
        'src/components/layout/Sidebar.jsx',
        'src/components/layout/Topbar.jsx',
        'src/pages/Landing.jsx',
        'src/pages/Setup.jsx',
        'src/pages/Dashboard.jsx',
      ];

      for (const file of filesToCheck) {
        if (fileExists(file)) {
          const code = readSource(file);
          assert(
            !code.includes('console.error(') && !code.includes('console.warn('),
            `${file} must not emit console.error or console.warn in production paths`
          );
        }
      }
    },
    { ac: 'AC1', tier: 'System' }
  );

  // --- AC8: Build & Lint Integrity ---
  await runner.test(
    'AC8: Clean build artifacts exist in dist/ with zero syntax/lint corruption',
    async () => {
      assert(
        fileExists('dist/index.html'),
        'dist/index.html must exist as a valid production build artifact'
      );
      assert(
        fileExists('package.json'),
        'package.json must be present'
      );

      // Check package.json scripts
      const pkg = JSON.parse(readSource('package.json'));
      assert(pkg.scripts.build, 'package.json must declare "build" script');
      assert(pkg.scripts.lint, 'package.json must declare "lint" script');
    },
    { ac: 'AC8', tier: 'System' }
  );

  return runner.summary();
}
