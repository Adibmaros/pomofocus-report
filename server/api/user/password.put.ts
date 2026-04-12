import { requireUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  const result = passwordSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors[0].message,
    })
  }

  const { currentPassword, newPassword } = result.data

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || !user.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot change password for OAuth accounts',
    })
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Current password is incorrect',
    })
  }

  // Hash and update
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  return { success: true }
})
