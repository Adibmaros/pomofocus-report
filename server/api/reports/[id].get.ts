import { requireUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Report ID is required',
    })
  }

  const report = await prisma.report.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!report) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Report not found',
    })
  }

  return report
})
