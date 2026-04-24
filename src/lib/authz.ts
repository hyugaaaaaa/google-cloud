type AdminUserLike = {
  email?: string | null
  app_metadata?: Record<string, unknown> | null
  user_metadata?: Record<string, unknown> | null
} | null | undefined

function readRole(metadata: Record<string, unknown> | null | undefined): string {
  const rawRole = metadata?.role
  return typeof rawRole === 'string' ? rawRole.toLowerCase() : ''
}

function getAdminAllowlist() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminUser(user: AdminUserLike): boolean {
  if (!user) return false

  const appRole = readRole(user.app_metadata)
  if (appRole === 'admin') return true

  const userRole = readRole(user.user_metadata)
  if (userRole === 'admin') return true

  if (!user.email) return false
  const allowlist = getAdminAllowlist()
  return allowlist.includes(user.email.toLowerCase())
}
