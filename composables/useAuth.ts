import { useState, computed } from '#imports'

/**
 * Standalone stub of the Academy `useAuth` composable.
 *
 * The real app authenticates against a backend; this dedicated Syllabus
 * Assistant repo has no users database, so we seed a single local "teacher"
 * identity. That's enough for the editor to pre-fill the author chip and for
 * the flow to run end-to-end without a login step.
 *
 * Swap the body of `fetchUser`/`login`/`logout` for real API calls if you ever
 * wire this app to a backend.
 */

interface AuthUser {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  role?: string
}

const LOCAL_USER: AuthUser = {
  _id: 'local-teacher',
  username: 'you',
  firstName: 'You',
  lastName: '',
  email: 'you@example.com',
  role: 'teacher'
}

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth-user', () => LOCAL_USER)
  const authLoading = useState<boolean>('auth-loading', () => false)

  const fetchUser = async () => {
    user.value = LOCAL_USER
    return user.value
  }

  const login = async () => ({ user: user.value })
  const logout = async () => { user.value = null }

  const isAuthenticated = computed(() => Boolean(user.value))

  return { user, isAuthenticated, authLoading, fetchUser, login, logout }
}
