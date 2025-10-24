import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import { usersTable, rolesTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { findUserByApiKey } from '@/modules/auth/service'

export const authMiddleware = () => {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization')
      const apiKeyHeader = c.req.header('x-api-key')

      if (authHeader && authHeader.startsWith('Bearer ')) {
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
            role: rolesTable,
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
        c.set('auth', { strategy: 'jwt', token, payload })

        await next()
        return
      }

      if (apiKeyHeader) {
        const rawApiKey = apiKeyHeader.trim()
        if (!rawApiKey) {
          return c.json({ message: 'Invalid API key' }, 401)
        }

        const lookup = await findUserByApiKey(rawApiKey)

        if (!lookup) {
          return c.json({ message: 'Invalid API key' }, 401)
        }

        c.set('user', lookup.user)
        c.set('auth', { strategy: 'api-key', apiKey: lookup.apiKey })

        await next()
        return
      }

      if (authHeader) {
        return c.json({ message: 'Missing or invalid token' }, 401)
      }

      return c.json({ message: 'Missing credentials' }, 401)
    } catch (err) {
      console.error('[auth] error:', err)
      return c.json({ message: 'Auth middleware error' }, 500)
    }
  }
}
