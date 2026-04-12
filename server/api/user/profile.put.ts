import { setUserSession, requireUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2).max(100),
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  const result = profileSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: (result as any).error.issues[0].message,
    })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: result.data.name },
  })

  // Update session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      avatar: user.avatar,
    },
  })

  return { success: true }
})
