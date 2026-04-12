import { defineOAuthGoogleEventHandler } from '#auth-utils/google'
import { setUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: googleUser }) {
    // Check if user exists by Google ID
    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.sub },
    })

    if (!user) {
      // Check if user exists by email
      user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      })

      if (user) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.sub,
            avatar: googleUser.picture || user.avatar,
            name: user.name || googleUser.name,
          },
        })
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.sub,
            avatar: googleUser.picture,
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
      }
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

    return sendRedirect(event, '/dashboard')
  },

  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/auth/login?error=oauth_failed')
  },
})
