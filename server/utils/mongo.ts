import mongoose from 'mongoose'
import { ActivityModule } from '../models/activityModule.model'

/**
 * Serverless-safe MongoDB connection.
 *
 * On Vercel each function freezes/thaws between invocations, so connecting once
 * in a startup plugin is unreliable. Instead we cache the connection promise and
 * `await connectMongo()` at the start of every DB operation — cheap once warm,
 * and it re-establishes after a cold start. `bufferCommands:false` makes queries
 * fail fast instead of hanging if the connection isn't ready.
 */

const ACTIVITY_SEED = [
  { name: 'How XRPL Consensus Works', description: 'Walk through the XRP Ledger Consensus Protocol and why it settles in 3–5 seconds without mining.', type: 'lesson', metadata: { estimatedTime: 25 }, authors: [{ username: 'xrpl-edu' }] },
  { name: 'Your First XRPL Transaction', description: 'Generate a testnet wallet, fund it from the faucet, and submit a Payment with a client library.', type: 'lesson', metadata: { estimatedTime: 40 }, authors: [{ username: 'xrpl-edu' }] },
  { name: 'Issuing Tokens & Trustlines', description: 'Create an issued currency, set up trustlines, and understand authorized trustlines and freezes.', type: 'lesson', metadata: { estimatedTime: 35 }, authors: [{ username: 'ledger-labs' }] },
  { name: 'AMMs on the XRP Ledger', description: 'Provide liquidity, swap assets, and reason about slippage on the native automated market maker.', type: 'lesson', metadata: { estimatedTime: 30 }, authors: [{ username: 'ledger-labs' }] },
  { name: 'XRPL Fundamentals — Quiz', description: 'Check your understanding of accounts, reserves, fees, and the ledger close cycle.', type: 'quiz', metadata: { estimatedTime: 10 }, authors: [{ username: 'xrpl-edu' }] },
  { name: 'Build a Payments App', description: 'Integrate XRPL payments into a small web app, including destination tags and reliable submission.', type: 'lesson', metadata: { estimatedTime: 60 }, authors: [{ username: 'devrel' }] }
]

let promise: Promise<typeof mongoose> | null = null

export function connectMongo() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose)
  if (!promise) {
    const uri = useRuntimeConfig().mongodbUri as string
    if (!uri) {
      throw createError({ statusCode: 500, statusMessage: 'MONGODB_URI is not set (configure it in your environment).' })
    }
    mongoose.set('bufferCommands', false)
    promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then(async (m) => {
        // Seed the activity catalogue once.
        if ((await ActivityModule.estimatedDocumentCount()) === 0) {
          await ActivityModule.insertMany(ACTIVITY_SEED)
        }
        return m
      })
      .catch((err) => {
        promise = null // allow the next request to retry
        throw err
      })
  }
  return promise
}
