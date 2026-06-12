/**
 * Mock activity library.
 *
 * The Syllabus Assistant surfaces these as "recommended Academy activities"
 * on the final step. In the real app this is backed by MongoDB; here we serve
 * a small static catalogue so the flow produces the same result offline.
 * Replace with a real fetch (or proxy to the Academy API) when available.
 */
export default defineEventHandler(() => [
  {
    _id: 'act-consensus',
    name: 'How XRPL Consensus Works',
    description: 'Walk through the XRP Ledger Consensus Protocol and why it settles in 3–5 seconds without mining.',
    type: 'lesson',
    metadata: { estimatedTime: 25 },
    authors: [{ _id: 'u1', username: 'xrpl-edu' }]
  },
  {
    _id: 'act-first-tx',
    name: 'Your First XRPL Transaction',
    description: 'Generate a testnet wallet, fund it from the faucet, and submit a Payment with a client library.',
    type: 'lesson',
    metadata: { estimatedTime: 40 },
    authors: [{ _id: 'u1', username: 'xrpl-edu' }]
  },
  {
    _id: 'act-tokens',
    name: 'Issuing Tokens & Trustlines',
    description: 'Create an issued currency, set up trustlines, and understand authorized trustlines and freezes.',
    type: 'lesson',
    metadata: { estimatedTime: 35 },
    authors: [{ _id: 'u2', username: 'ledger-labs' }]
  },
  {
    _id: 'act-amm',
    name: 'AMMs on the XRP Ledger',
    description: 'Provide liquidity, swap assets, and reason about slippage on the native automated market maker.',
    type: 'lesson',
    metadata: { estimatedTime: 30 },
    authors: [{ _id: 'u2', username: 'ledger-labs' }]
  },
  {
    _id: 'act-quiz-fundamentals',
    name: 'XRPL Fundamentals — Quiz',
    description: 'Check your understanding of accounts, reserves, fees, and the ledger close cycle.',
    type: 'quiz',
    metadata: { estimatedTime: 10 },
    authors: [{ _id: 'u1', username: 'xrpl-edu' }]
  },
  {
    _id: 'act-payments-app',
    name: 'Build a Payments App',
    description: 'Integrate XRPL payments into a small web app, including destination tags and reliable submission.',
    type: 'lesson',
    metadata: { estimatedTime: 60 },
    authors: [{ _id: 'u3', username: 'devrel' }]
  }
])
