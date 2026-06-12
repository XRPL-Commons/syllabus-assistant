import { AdminState } from '../models/adminState.model'

/**
 * Mongo-backed admin lock state (auto-imported by the API routes).
 * Failed attempts are counted globally; after MAX_ATTEMPTS the `locked` flag is
 * set and stays set until a human resets it in the db.
 */

export const MAX_ATTEMPTS = 3

export async function readAdminState() {
  const s = await AdminState.findOneAndUpdate(
    { key: 'admin' },
    { $setOnInsert: { failedAttempts: 0, locked: false } },
    { upsert: true, new: true }
  )
  return { failedAttempts: s.failedAttempts, locked: s.locked }
}

export async function writeAdminState(state: { failedAttempts: number; locked: boolean }) {
  await AdminState.updateOne(
    { key: 'admin' },
    { $set: { failedAttempts: state.failedAttempts, locked: state.locked } },
    { upsert: true }
  )
}
