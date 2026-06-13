import mongoose from 'mongoose'

/**
 * Diagnostics: hit /api/health on the deployment to see the real DB state.
 * `{ ok:true, state:"connected" }` means MongoDB is reachable; otherwise
 * `error` carries the exact connection failure (timeout, auth, IP, env, …).
 */
const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting']

export default defineEventHandler(async () => {
  try {
    await connectMongo()
    return { ok: true, state: STATES[mongoose.connection.readyState], db: mongoose.connection.name }
  } catch (e: any) {
    return {
      ok: false,
      state: STATES[mongoose.connection.readyState] ?? mongoose.connection.readyState,
      hasUri: Boolean(useRuntimeConfig().mongodbUri),
      error: e?.message || String(e)
    }
  }
})
