declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string | null
    plan: 'FREE' | 'PRO'
    avatar: string | null
  }
}

export {}
