import { requireUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  // Get user profile to check latest plan
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true }
  })

  // Get all reports for user
  const reports = await prisma.report.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate stats
  const totalMinutes = reports.reduce((sum, r) => sum + r.totalMinutes, 0)
  const totalActiveDays = reports.reduce((sum, r) => sum + r.activeDays, 0)

  return {
    reports,
    plan: user?.plan || 'FREE',
    stats: {
      totalReports: reports.length,
      totalMinutes,
      totalActiveDays,
    },
  }
})
