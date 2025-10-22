import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import { usersTable, rolesTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@/db'

export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Missing or invalid token' }, 401)
      }

      const token = authHeader.slice(7).trim()
      const secret = process.env.JWT_SECRET
      if (!secret) {
        return c.json({ message: 'JWT secret not configured' }, 500)
      }

      const payload = await verify(token, secret)

      if (!payload?.sub) {
        return c.json({ message: 'Invalid payload (no sub)' }, 401)
      }

      const [user] = await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          name: usersTable.name,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
          passwordChangedAt: usersTable.passwordChangedAt,
          role: {
            id: rolesTable.id,
            name: rolesTable.name,
            canPostLogin: rolesTable.canPostLogin,
            canGetMyUser: rolesTable.canGetMyUser,
            canGetUsers: rolesTable.canGetUsers,
          }
        })
        .from(usersTable)
        .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
        .where(eq(usersTable.id, String(payload.sub)))
        .limit(1)

      if (!user) {
        return c.json({ message: 'User not found' }, 401)
      }

      if (user.passwordChangedAt && payload.iat) {
        const passwordChangedAtTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
        
        if (passwordChangedAtTimestamp > payload.iat) {
          return c.json({ 
            error: 'Unauthorized - Token invalid due to password change. Please login again.' 
          }, 401);
        }
      }
  

      c.set('user', user)
      c.set('auth', { token, payload })

      await next()
    } catch (err) {
      console.error('[auth] error:', err)
      return c.json({ message: 'Auth middleware error' }, 500)
    }
  }
}
