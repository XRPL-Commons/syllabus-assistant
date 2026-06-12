/**
 * Password-gated admin read of all submissions, with a persistent brute-force
 * lockout. After MAX_ATTEMPTS failed attempts (counted globally, any IP) the
 * `locked` boolean in the db is set and ALL access is refused — including the
 * correct password — until a human resets it (delete `.data/admin.json` or set
 * `locked: false`, `failedAttempts: 0`).
 *
 * Password is checked server-side against runtimeConfig.adminPassword
 * (set ADMIN_PASSWORD; defaults to "changeme").
 */
export default defineEventHandler(async (event) => {
  const { password } = (await readBody(event)) ?? {}
  const cfg = useRuntimeConfig(event)

  const state = await readAdminState()

  // Already locked → nobody gets in until it's reset in the db.
  if (state.locked) {
    throw createError({ statusCode: 423, statusMessage: 'Admin access is locked' })
  }

  // Wrong / missing password → count the failure and maybe lock.
  if (!password || password !== cfg.adminPassword) {
    const failedAttempts = state.failedAttempts + 1
    const locked = failedAttempts >= MAX_ATTEMPTS
    await writeAdminState({ failedAttempts, locked })
    if (locked) {
      throw createError({ statusCode: 423, statusMessage: 'Admin access is locked' })
    }
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  // Correct password → clear the failure counter and return the data.
  if (state.failedAttempts !== 0) {
    await writeAdminState({ failedAttempts: 0, locked: false })
  }
  return await readSubmissions()
})
