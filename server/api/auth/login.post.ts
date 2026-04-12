import { setUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.errors[0].message,
    })
  }

  const { email, password } = result.data

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.password) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password',
    })
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password',
    })
  }

  // Set session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      avatar: user.avatar,
    },
  })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  }
})
