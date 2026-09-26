#!/usr/bin/env node
// scripts/verify-e2e.mjs
// Master E2E Automated Verification Runner for Aasra Digital Estate Closure Assistant.
// Validates R1-R4 and AC1-AC8 across 4 Test Tiers.

import { ConsoleInterceptor, c } from './tests/test-utils.mjs';
import { runTier1Tests } from './tests/tier1-features.mjs';
import { runTier2Tests } from './tests/tier2-boundaries.mjs';
import { runTier3Tests } from './tests/tier3-combinations.mjs';
import { runTier4Tests } from './tests/tier4-scenarios.mjs';
import { runSystemIntegrityTests } from './tests/system-integrity.mjs';

// --- Parse CLI Arguments ---
const args = process.argv.slice(2);
const tierArg = args.find((a) => a.startsWith('--tier='))?.split('=')[1];
const acArg = args.find((a) => a.startsWith('--ac='))?.split('=')[1];
const isJson = args.includes('--json');
const isVerbose = args.includes('--verbose');

async function main() {
  const consoleTrap = new ConsoleInterceptor();
  consoleTrap.start();

  const startTime = Date.now();

  if (!isJson) {
    console.log('\n' + c.bold(c.cyan('======================================================================')));
    console.log(c.bold(c.cyan('  AASRA DIGITAL ESTATE CLOSURE ASSISTANT — E2E VERIFICATION SUITE  ')));
    console.log(c.dim('  Validating R1-R4 & AC1-AC8 across Tiers 1-4 (Opaque-box Verification)'));
    console.log(c.bold(c.cyan('======================================================================')) + '\n');
  }

  const allSummaries = [];

  // Filter tiers if requested
  const shouldRun = (tierNum) => !tierArg || tierArg === String(tierNum);

  if (shouldRun(1)) {
    if (!isJson) console.log(c.bold('\n[Tier 1: Feature Coverage (AC1, AC2, AC3, AC4, AC5)]'));
    allSummaries.push(await runTier1Tests());
  }

  if (shouldRun(2)) {
    if (!isJson) console.log(c.bold('\n[Tier 2: Boundary & Corner Cases (AC3, R2)]'));
    allSummaries.push(await runTier2Tests());
  }

  if (shouldRun(3)) {
    if (!isJson) console.log(c.bold('\n[Tier 3: Cross-Feature Combinations (AC3, AC4, AC6)]'));
    allSummaries.push(await runTier3Tests());
  }

  if (shouldRun(4)) {
    if (!isJson) console.log(c.bold('\n[Tier 4: Real-World Application Scenario (End-to-End Intake Flow)]'));
    allSummaries.push(await runTier4Tests());
  }

  if (!tierArg) {
    if (!isJson) console.log(c.bold('\n[System Integrity: Theme, Console Logs & Build (AC1, AC7, AC8)]'));
    allSummaries.push(await runSystemIntegrityTests());
  }

  const consoleLogs = consoleTrap.stop();
  const totalDuration = Date.now() - startTime;

  // Flatten all results
  const allResults = allSummaries.flatMap((s) => s.results);
  const totalTests = allResults.length;
  const passedTests = allResults.filter((r) => r.pass).length;
  const failedTests = totalTests - passedTests;

  // Group by Acceptance Criteria
  const acMap = {
    AC1: { name: 'Route Loading & Zero Console Errors', total: 0, passed: 0 },
    AC2: { name: 'Landing Page Hero, Tagline, CTAs & Steps', total: 0, passed: 0 },
    AC3: { name: 'Setup Form Validation & Navigation Barrier', total: 0, passed: 0 },
    AC4: { name: 'Dashboard Cards, Attention List & Recharts', total: 0, passed: 0 },
    AC5: { name: 'Placeholder Headings on Future Modules', total: 0, passed: 0 },
    AC6: { name: 'Responsive Layout & Mobile Drawer', total: 0, passed: 0 },
    AC7: { name: 'Fintech Palette & Inter Typography', total: 0, passed: 0 },
    AC8: { name: 'Build & Lint Clean Pass', total: 0, passed: 0 },
  };

  for (const r of allResults) {
    if (r.ac && acMap[r.ac]) {
      acMap[r.ac].total++;
      if (r.pass) acMap[r.ac].passed++;
    }
  }

  if (isJson) {
    const output = {
      timestamp: new Date().toISOString(),
      durationMs: totalDuration,
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      consoleErrors: consoleLogs.errorCount,
      consoleWarnings: consoleLogs.warningCount,
      acSummary: acMap,
      tiers: allSummaries,
    };
    console.log(JSON.stringify(output, null, 2));
    process.exit(failedTests === 0 ? 0 : 1);
  }

  // --- Output Summary Table ---
  console.log('\n' + c.bold('----------------------------------------------------------------------'));
  console.log(c.bold('  ACCEPTANCE CRITERIA COMPLIANCE SCORECARD'));
  console.log('----------------------------------------------------------------------');

  for (const [acKey, acData] of Object.entries(acMap)) {
    const status =
      acData.total === 0
        ? c.dim('SKIPPED')
        : acData.passed === acData.total
        ? c.green('PASS (100%)')
        : c.red(`FAIL (${acData.passed}/${acData.total})`);
    console.log(`  ${c.bold(acKey)}: ${acData.name.padEnd(46)} [${status}]`);
  }

  console.log('----------------------------------------------------------------------');
  console.log(c.bold('  EXECUTION SUMMARY'));
  console.log('----------------------------------------------------------------------');
  console.log(`  Total Test Cases:    ${c.bold(totalTests)}`);
  console.log(`  Passed Test Cases:   ${c.green(c.bold(passedTests))}`);
  console.log(`  Failed Test Cases:   ${failedTests > 0 ? c.red(c.bold(failedTests)) : c.green('0')}`);
  console.log(`  Console Errors:      ${consoleLogs.errorCount > 0 ? c.red(consoleLogs.errorCount) : c.green('0')}`);
  console.log(`  Console Warnings:    ${consoleLogs.warningCount > 0 ? c.yellow(consoleLogs.warningCount) : c.green('0')}`);
  console.log(`  Total Execution:     ${c.dim(totalDuration + 'ms')}`);
  console.log('----------------------------------------------------------------------');

  if (failedTests > 0) {
    console.log('\n' + c.bold(c.red('  FAILED TEST DETAILS:')));
    for (const r of allResults.filter((r) => !r.pass)) {
      console.log(`  ${c.red('•')} [${r.ac || 'N/A'}] ${c.bold(r.title)}`);
      console.log(`    ${c.red(r.error)}`);
    }
    console.log('\n' + c.bold(c.red('✖ VERIFICATION FAILED: Fix the above defects and re-run.')) + '\n');
    process.exit(1);
  } else {
    console.log('\n' + c.bold(c.green('✔ ALL ACCEPTANCE CRITERIA VERIFIED (100% PASS)')) + '\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\nFatal error executing test runner:', err);
  process.exit(1);
});
