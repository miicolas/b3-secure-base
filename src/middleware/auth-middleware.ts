import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'
import { usersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@/db'

export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HTTPException(401, { message: 'Missing or invalid token' })
      }

      const token = authHeader.slice(7).trim()
      const secret = process.env.JWT_SECRET
      if (!secret) {
        throw new HTTPException(500, { message: 'JWT secret not configured' })
      }

      const payload = await verify(token, secret)

      if (!payload?.sub) {
        throw new HTTPException(401, { message: 'Invalid payload (no sub)' })
      }

      const [user] = await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          name: usersTable.name,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
        })
        .from(usersTable)
        .where(eq(usersTable.id, String(payload.sub)))
        .limit(1)

      if (!user) {
        throw new HTTPException(401, { message: 'User not found' })
      }

      c.set('user', user)
      c.set('auth', { token, payload })

      await next()
    } catch (err) {
      if (err instanceof HTTPException) throw err
      console.error('[auth] error:', err)
      throw new HTTPException(500, { message: 'Auth middleware error' })
    }
  }
}
