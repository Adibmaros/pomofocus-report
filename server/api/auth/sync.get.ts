import { setUserSession, getUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    return { success: false, message: 'Not logged in' }
  }

  // Get latest data from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    return { success: false, message: 'User not found' }
  }

  // Update session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      avatar: user.avatar,
    }
  })

  return { 
    success: true, 
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan
    }
  }
})
