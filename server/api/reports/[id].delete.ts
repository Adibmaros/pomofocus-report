import { requireUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'
import { deleteReportPDF } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Report ID is required',
    })
  }

  // Ensure report belongs to user
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

  // Delete from storage if exists
  if (report.pdfPath) {
    await deleteReportPDF(report.pdfPath)
  }

  // Delete report
  await prisma.report.delete({
    where: { id },
  })

  return { success: true }
})
