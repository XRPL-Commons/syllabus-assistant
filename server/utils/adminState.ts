import { promises as fs } from 'node:fs'
import { join } from 'node:path'

/**
 * Persistent admin auth state (the "database" boolean lock).
 *
 * Failed password attempts are counted globally (regardless of IP). After
 * MAX_ATTEMPTS failures, `locked` flips to true and stays true — the admin
 * endpoint then refuses everyone, including the correct password, until a human
 * resets it in the db: delete `.data/admin.json`, or set `locked: false` and
 * `failedAttempts: 0`.
 */

export const MAX_ATTEMPTS = 3

export interface AdminState {
  failedAttempts: number
  locked: boolean
}

const DIR = join(process.cwd(), '.data')
const FILE = join(DIR, 'admin.json')

export async function readAdminState(): Promise<AdminState> {
  try {
    const s = JSON.parse(await fs.readFile(FILE, 'utf-8'))
    return { failedAttempts: Number(s.failedAttempts) || 0, locked: Boolean(s.locked) }
  } catch {
    return { failedAttempts: 0, locked: false }
  }
}

export async function writeAdminState(state: AdminState): Promise<void> {
  await fs.mkdir(DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(state, null, 2), 'utf-8')
}
