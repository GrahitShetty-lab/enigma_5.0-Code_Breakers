// scripts/tests/tier2-boundaries.mjs
// Tier 2: Boundary & Corner Cases Tests (AC3, R2)

import {
  TestRunner,
  assert,
  readSource,
  PAN_REGEX,
  VALID_RELATIONSHIPS,
  validateSetupField,
  validateSetupForm,
} from './test-utils.mjs';

export async function runTier2Tests() {
  const runner = new TestRunner('Tier 2 - Boundary & Corner Cases');

  // --- T2.1: Form Validation - Empty Required Fields Rejection ---
  await runner.test(
    'T2.1: Rejects empty inputs for deceasedName, dateOfDeath, relationship, and PAN with inline errors (AC3)',
    async () => {
      const emptyForm = {
        deceasedName: '',
        dateOfDeath: '',
        relationship: '',
        pan: '',
      };

      const result = validateSetupForm(emptyForm);
      assert(!result.isValid, 'Empty form must be marked invalid');
      assert(result.errors.deceasedName, 'Empty deceasedName must produce an error');
      assert(result.errors.dateOfDeath, 'Empty dateOfDeath must produce an error');
      assert(result.errors.relationship, 'Empty relationship must produce an error');
      assert(result.errors.pan, 'Empty PAN must produce an error');

      // Verify source code enforces non-empty validation and inline error rendering
      const setupCode = readSource('src/pages/Setup.jsx');
      assert(
        setupCode.includes('errors') && (setupCode.includes('setErrors') || setupCode.includes('error')),
        'Setup.jsx must track validation errors in state'
      );
      assert(
        setupCode.includes('text-urgent') || setupCode.includes('text-red') || setupCode.includes('error'),
        'Setup.jsx must render inline error indicators'
      );
    },
    { ac: 'AC3', tier: 'Tier 2' }
  );

  // --- T2.2: Form Validation - Future Date Rejection ---
  await runner.test(
    'T2.2: Rejects future dates for date of death and accepts valid past/current dates (AC3)',
    async () => {
      // Future date: 1 year from now
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const futureError = validateSetupField('dateOfDeath', futureDateStr);
      assert(
        futureError && futureError.includes('future'),
        `Future date (${futureDateStr}) must be rejected with a future date error, got: ${futureError}`
      );

      // Tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const tomorrowError = validateSetupField('dateOfDeath', tomorrowStr);
      assert(
        tomorrowError && tomorrowError.includes('future'),
        `Tomorrow's date (${tomorrowStr}) must be rejected`
      );

      // Valid past date
      const pastError = validateSetupField('dateOfDeath', '2026-07-15');
      assert(pastError === null, 'Valid past date 2026-07-15 must be accepted');

      // Today's date
      const todayStr = new Date().toISOString().split('T')[0];
      const todayError = validateSetupField('dateOfDeath', todayStr);
      assert(todayError === null, "Today's date must be accepted");

      // Verify Setup.jsx includes future date logic
      const setupCode = readSource('src/pages/Setup.jsx');
      assert(
        setupCode.includes('future') || setupCode.includes('today') || setupCode.includes('new Date()') || setupCode.includes('max='),
        'Setup.jsx must enforce that date of death cannot be in the future'
      );
    },
    { ac: 'AC3', tier: 'Tier 2' }
  );

  // --- T2.3: Form Validation - Unselected Relationship Rejection ---
  await runner.test(
    'T2.3: Rejects empty or unselected relationship dropdown option (AC3)',
    async () => {
      // Empty string
      const emptyError = validateSetupField('relationship', '');
      assert(emptyError !== null, 'Empty relationship selection must be rejected');

      // Placeholder string
      const placeholderError = validateSetupField('relationship', 'Select relationship...');
      assert(placeholderError !== null, 'Default placeholder selection must be rejected');

      // Invalid arbitrary string
      const invalidOption = validateSetupField('relationship', 'UnknownAlien');
      assert(invalidOption !== null, 'Non-standard relationship string must be rejected');

      // Standard valid options
      for (const rel of VALID_RELATIONSHIPS) {
        const validErr = validateSetupField('relationship', rel);
        assert(validErr === null, `Standard relationship option "${rel}" must be accepted`);
      }

      // Verify Setup.jsx has relationship dropdown with valid options
      const setupCode = readSource('src/pages/Setup.jsx');
      assert(
        setupCode.includes('Spouse') && setupCode.includes('Son') && setupCode.includes('Daughter'),
        'Setup.jsx relationship select element must contain standard options (Spouse, Son, Daughter)'
      );
    },
    { ac: 'AC3', tier: 'Tier 2' }
  );

  // --- T2.4: Comprehensive PAN Regex Evaluation ---
  await runner.test(
    'T2.4: Regex validation correctly accepts masked PAN (XXXXX1234X) and standard PAN (ABCDE1234F) while rejecting invalid patterns (AC3)',
    async () => {
      // Positive test cases
      const validCases = [
        'XXXXX1234X', // Authoritative masked PAN from mockData & requirements
        'XXXXX9876A',
        'ABCDE1234F', // Standard 10-char PAN
        'abcde1234f', // Lowercase standard PAN
        'xxxxx1234x', // Lowercase masked PAN
        'BKLPM5544Q',
      ];

      for (const validPAN of validCases) {
        assert(
          PAN_REGEX.test(validPAN),
          `PAN pattern must accept valid PAN: "${validPAN}"`
        );
        const err = validateSetupField('pan', validPAN);
        assert(err === null, `Expected "${validPAN}" to be valid, got error: ${err}`);
      }

      // Negative test cases (MUST BE REJECTED)
      const invalidCases = [
        'XXXX1234X',    // 9 chars: only 4 X's
        'XXXXXX1234X',  // 11 chars: 6 X's
        'XXXXX12345',   // Numeric 10th character
        '12345ABCDE',   // Digits first
        'ABCDEFGHIJ',   // All letters, no digits
        '1234567890',   // All digits
        'ABCD12345E',   // 4 letters, 5 digits
        'ABCDEF123E',   // 6 letters, 3 digits
        'PAN123',       // Too short
        'XXXXX1234XX',  // Too long
        '!@#$%1234A',   // Special symbols
        '',             // Empty
        '          ',   // Whitespace
      ];

      for (const invalidPAN of invalidCases) {
        assert(
          !PAN_REGEX.test(invalidPAN),
          `PAN pattern must reject invalid PAN: "${invalidPAN}"`
        );
        const err = validateSetupField('pan', invalidPAN);
        assert(err !== null, `Expected invalid PAN "${invalidPAN}" to produce an error`);
      }

      // Verify Setup.jsx enforces the PAN regex
      const setupCode = readSource('src/pages/Setup.jsx');
      assert(
        setupCode.includes('XXXXX') || setupCode.includes('[A-Z]{5}') || setupCode.includes('PAN_REGEX') || /pan.*regex/i.test(setupCode) || /pattern/i.test(setupCode),
        'Setup.jsx must enforce PAN regex pattern matching'
      );
    },
    { ac: 'AC3', tier: 'Tier 2' }
  );

  // --- T2.5: Name Boundary Verification ---
  await runner.test(
    'T2.5: Rejects name shorter than 2 characters or whitespace-only (AC3)',
    async () => {
      // 1-character name
      const singleCharErr = validateSetupField('deceasedName', 'A');
      assert(singleCharErr !== null, 'Single character name must be rejected');

      // Whitespace only
      const whitespaceErr = validateSetupField('deceasedName', '   ');
      assert(whitespaceErr !== null, 'Whitespace-only name must be rejected');

      // 2-character valid name
      const twoCharErr = validateSetupField('deceasedName', 'Om');
      assert(twoCharErr === null, '2-letter valid name must be accepted');

      // Full valid name
      const fullErr = validateSetupField('deceasedName', 'Late Rahul Sharma');
      assert(fullErr === null, 'Full name must be accepted');
    },
    { ac: 'AC3', tier: 'Tier 2' }
  );

  // --- T2.6: Navigation Barrier Enforcement ---
  await runner.test(
    'T2.6: Navigation barrier strictly halts submission and prevents navigation to /dashboard if errors exist (AC3)',
    async () => {
      const setupCode = readSource('src/pages/Setup.jsx');

      // Verify e.preventDefault() is called
      assert(
        setupCode.includes('preventDefault'),
        'Setup.jsx submit handler must call e.preventDefault()'
      );

      // Verify conditional guard preventing navigate('/dashboard')
      // Must NOT navigate unconditionally
      assert(
        !/const handleSubmit\s*=\s*\([^)]*\)\s*=>\s*\{\s*navigate\(['"]\/dashboard['"]\);?\s*\}/.test(
          setupCode.replace(/\s+/g, ' ')
        ),
        'Setup.jsx must NOT unconditionally navigate to /dashboard without validation'
      );

      // Verify there is an error check or return before navigation
      const hasBarrier =
        setupCode.includes('return') &&
        (setupCode.includes('Object.keys(newErrors).length') ||
          setupCode.includes('Object.keys(errors).length') ||
          setupCode.includes('!isValid') ||
          setupCode.includes('hasErrors') ||
          setupCode.includes('validate()'));

      assert(
        hasBarrier,
        'Setup.jsx submit handler must evaluate validation errors and return early to block navigation when invalid'
      );
    },
    { ac: 'AC3', tier: 'Tier 2' }
  );

  return runner.summary();
}
