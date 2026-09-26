// scripts/tests/test-utils.mjs
// Shared testing utilities, assertion helpers, and simulation harnesses for Aasra E2E test suite.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, '..', '..');

// --- Terminal Colors & Formatting ---
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

export const c = {
  bold: (t) => `${colors.bold}${t}${colors.reset}`,
  dim: (t) => `${colors.dim}${t}${colors.reset}`,
  green: (t) => `${colors.green}${t}${colors.reset}`,
  red: (t) => `${colors.red}${t}${colors.reset}`,
  yellow: (t) => `${colors.yellow}${t}${colors.reset}`,
  cyan: (t) => `${colors.cyan}${t}${colors.reset}`,
  magenta: (t) => `${colors.magenta}${t}${colors.reset}`,
};

// --- Test Result Collector ---
export class TestRunner {
  constructor(name) {
    this.name = name;
    this.results = [];
    this.startTime = Date.now();
  }

  record(pass, title, details = null, error = null, ac = null, tier = null) {
    this.results.push({
      pass,
      title,
      details,
      error,
      ac,
      tier,
      durationMs: 0,
    });
  }

  async test(title, fn, options = {}) {
    const { ac = null, tier = null } = options;
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      this.results.push({ pass: true, title, durationMs, ac, tier });
      console.log(`  ${c.green('✔')} ${title} ${c.dim(`(${durationMs}ms)`)}`);
    } catch (err) {
      const durationMs = Date.now() - start;
      this.results.push({
        pass: false,
        title,
        durationMs,
        error: err.message || String(err),
        stack: err.stack,
        ac,
        tier,
      });
      console.log(`  ${c.red('✖')} ${title} ${c.dim(`(${durationMs}ms)`)}`);
      console.log(`    ${c.red(err.message || String(err))}`);
    }
  }

  summary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.pass).length;
    const failed = total - passed;
    const duration = Date.now() - this.startTime;
    return { name: this.name, total, passed, failed, duration, results: this.results };
  }
}

// --- Assertion Helpers ---
export function assert(condition, message, metadata = {}) {
  if (!condition) {
    const err = new Error(message || 'Assertion failed');
    err.metadata = metadata;
    throw err;
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message || 'Expected values to be strictly equal'}\n  Expected: ${JSON.stringify(
        expected
      )}\n  Actual:   ${JSON.stringify(actual)}`
    );
  }
}

export function assertIncludes(haystack, needle, message) {
  if (!haystack || !haystack.includes(needle)) {
    throw new Error(
      `${message || 'Expected string to include needle'}\n  Target does not contain: "${needle}"`
    );
  }
}

export function assertMatches(str, regex, message) {
  if (!regex.test(str)) {
    throw new Error(
      `${message || 'Expected string to match pattern'}\n  Value: "${str}"\n  Regex: ${regex}`
    );
  }
}

// --- File System & Source Inspection Helpers ---
export function readSource(relPath) {
  const fullPath = path.resolve(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Required file not found: ${relPath} (full: ${fullPath})`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

export function fileExists(relPath) {
  return fs.existsSync(path.resolve(ROOT_DIR, relPath));
}

// --- Authoritative Specifications ---
export const PAN_REGEX = /^([A-Z]{5}[0-9]{4}[A-Z]|XXXXX[0-9]{4}[A-Z])$/i;

export const VALID_RELATIONSHIPS = [
  'Spouse',
  'Son',
  'Daughter',
  'Parent',
  'Sibling',
  'Legal Heir',
  'Other',
];

// --- Form Validation Simulator according to R2 & AC3 Specification ---
export function validateSetupField(fieldName, value) {
  const val = typeof value === 'string' ? value.trim() : value;

  switch (fieldName) {
    case 'deceasedName':
      if (!val || val.length < 2) {
        return "Please enter the deceased person's full name (at least 2 letters).";
      }
      return null;

    case 'executorName':
      if (!val || val.length < 2) {
        return "Please enter the executor or claimant's full name.";
      }
      return null;

    case 'dateOfDeath':
      if (!val) {
        return 'Please enter a valid date of passing.';
      }
      const selected = new Date(val);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (isNaN(selected.getTime())) {
        return 'Invalid date format.';
      }
      if (selected > today) {
        return 'Date of passing cannot be in the future.';
      }
      return null;

    case 'relationship':
      if (!val || val === '' || val === 'Select relationship...') {
        return 'Please select your relationship to the deceased.';
      }
      if (!VALID_RELATIONSHIPS.includes(val)) {
        return 'Please select a valid relationship option.';
      }
      return null;

    case 'pan':
      if (!val) {
        return 'Please enter a PAN.';
      }
      if (!PAN_REGEX.test(val)) {
        return 'Please enter a valid 10-character PAN (e.g. ABCDE1234F or masked XXXXX1234X).';
      }
      return null;

    case 'accountCount':
      const count = Number(val);
      if (isNaN(count) || count < 0) {
        return 'Please enter an estimated number of financial accounts (0 or more).';
      }
      return null;

    default:
      return null;
  }
}

export function validateSetupForm(form) {
  const errors = {};
  const fields = ['deceasedName', 'dateOfDeath', 'relationship', 'pan'];
  if ('executorName' in form) fields.push('executorName');
  if ('accountCount' in form) fields.push('accountCount');

  for (const field of fields) {
    const err = validateSetupField(field, form[field]);
    if (err) {
      errors[field] = err;
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// --- Console Interceptor Harness for AC1 ---
export class ConsoleInterceptor {
  constructor() {
    this.originalError = console.error;
    this.originalWarn = console.warn;
    this.errors = [];
    this.warnings = [];
    this.active = false;
  }

  start() {
    this.errors = [];
    this.warnings = [];
    this.active = true;

    console.error = (...args) => {
      this.errors.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      this.originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.warnings.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      this.originalWarn.apply(console, args);
    };
  }

  stop() {
    if (this.active) {
      console.error = this.originalError;
      console.warn = this.originalWarn;
      this.active = false;
    }
    return {
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      errors: [...this.errors],
      warnings: [...this.warnings],
    };
  }
}
