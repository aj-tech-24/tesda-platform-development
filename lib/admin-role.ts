export type AdminRole = 'assessment_center' | 'training_center' | 'admin'

type AdminLikeUser = {
  email?: string | null
  user_metadata?: Record<string, any> | null
}

function normalizeRole(value?: string | null): AdminRole | null {
  if (!value) return null

  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_')

  if (normalized === 'assessment_center') return 'assessment_center'
  if (normalized === 'training_center') return 'training_center'
  if (normalized === 'admin') return 'admin'

  return null
}

export function inferAdminRoleFromEmail(email?: string | null): AdminRole | null {
  const normalizedEmail = (email || '').trim().toLowerCase()

  if (normalizedEmail === 'assessmentcenter@tesda.gov.ph') {
    return 'assessment_center'
  }

  if (normalizedEmail === 'trainingcenter@tesda.gov.ph') {
    return 'training_center'
  }

  return null
}

export function getAdminRole(user?: AdminLikeUser | null): AdminRole | null {
  if (!user) return null

  const roleFromMetadata = normalizeRole(
    (user.user_metadata?.admin_role as string | undefined) ||
      (user.user_metadata?.role as string | undefined) ||
      (user.user_metadata?.user_role as string | undefined),
  )

  if (roleFromMetadata) {
    return roleFromMetadata
  }

  return inferAdminRoleFromEmail(user.email)
}

export function canAccessAdminPath(role: AdminRole | null, pathname: string): boolean {
  if (!role || role === 'admin') {
    return true
  }

  const roleAllowedPrefixes: Record<Exclude<AdminRole, 'admin'>, string[]> = {
    assessment_center: ['/admin/dashboard', '/admin/assessment', '/admin/assessors', '/admin/registry', '/admin/import'],
    training_center: ['/admin/dashboard', '/admin/centers', '/admin/programs', '/admin/trainers', '/admin/registry', '/admin/import'],
  }

  return roleAllowedPrefixes[role].some((prefix) => pathname.startsWith(prefix))
}
