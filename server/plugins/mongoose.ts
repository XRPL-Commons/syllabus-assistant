import { defineNitroPlugin, useRuntimeConfig } from '#imports'
import mongoose from 'mongoose'
import { ActivityModule } from '../models/activityModule.model'

/**
 * Connect to MongoDB on server startup (same pattern as oasis), then seed the
 * activity catalogue once if the collection is empty.
 */

const ACTIVITY_SEED = [
  { name: 'How XRPL Consensus Works', description: 'Walk through the XRP Ledger Consensus Protocol and why it settles in 3–5 seconds without mining.', type: 'lesson', metadata: { estimatedTime: 25 }, authors: [{ username: 'xrpl-edu' }] },
  { name: 'Your First XRPL Transaction', description: 'Generate a testnet wallet, fund it from the faucet, and submit a Payment with a client library.', type: 'lesson', metadata: { estimatedTime: 40 }, authors: [{ username: 'xrpl-edu' }] },
  { name: 'Issuing Tokens & Trustlines', description: 'Create an issued currency, set up trustlines, and understand authorized trustlines and freezes.', type: 'lesson', metadata: { estimatedTime: 35 }, authors: [{ username: 'ledger-labs' }] },
  { name: 'AMMs on the XRP Ledger', description: 'Provide liquidity, swap assets, and reason about slippage on the native automated market maker.', type: 'lesson', metadata: { estimatedTime: 30 }, authors: [{ username: 'ledger-labs' }] },
  { name: 'XRPL Fundamentals — Quiz', description: 'Check your understanding of accounts, reserves, fees, and the ledger close cycle.', type: 'quiz', metadata: { estimatedTime: 10 }, authors: [{ username: 'xrpl-edu' }] },
  { name: 'Build a Payments App', description: 'Integrate XRPL payments into a small web app, including destination tags and reliable submission.', type: 'lesson', metadata: { estimatedTime: 60 }, authors: [{ username: 'devrel' }] }
]

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    throw new Error('MONGODB_URI is not defined — set it in .env')
  }

  await mongoose.connect(uri as string)

  if ((await ActivityModule.estimatedDocumentCount()) === 0) {
    await ActivityModule.insertMany(ACTIVITY_SEED)
  }
})
