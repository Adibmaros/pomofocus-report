import { setUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: (result as any).error.issues[0].message,
    })
  }

  const { name, email, password } = result.data

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Email already registered',
    })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  // Create initial subscription
  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'FREE',
      reportsUsed: 0,
      periodStart: now,
      periodEnd: periodEnd,
    },
  })

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
