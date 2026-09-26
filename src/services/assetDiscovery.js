// src/services/assetDiscovery.js
// Mock service that simulates discovering financial assets from uploaded documents.
// The implementation is deliberately simple and uses a timeout to mimic async I/O.
// It returns an array of discovered asset objects with the required fields.

/**
 * Simulated discovery of assets.
 * @returns {Promise<Array<{ name: string, category: string, estimatedValue: number, sourceDocument: string, confidence: number, reason: string }>>}
 */
export const discoverAssets = async () => {
  // Simulate network / processing latency
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  await delay(800); // 0.8 s delay to show loading UI

  // Mock data – can be extended later.
  return [
    {
      name: 'ICICI Bank Savings Account',
      category: 'Bank Account',
      estimatedValue: 150000,
      sourceDocument: 'Bank Statement.pdf',
      confidence: 92,
      reason: 'Account number and bank name detected in uploaded document',
    },
    {
      name: 'Bitcoin Wallet',
      category: 'Crypto',
      estimatedValue: 250000,
      sourceDocument: 'Crypto Portfolio.xlsx',
      confidence: 85,
      reason: 'Wallet address pattern and transaction list identified',
    },
    {
      name: 'UPI Digital Wallet',
      category: 'Digital Wallet',
      estimatedValue: 50000,
      sourceDocument: 'UPI_Transactions.pdf',
      confidence: 88,
      reason: 'UPI transaction IDs and linked mobile number extracted',
    },
  ];
};
