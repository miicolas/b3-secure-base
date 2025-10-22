import type { Context, Next } from 'hono';

type Permission = 'canPostLogin' | 'canGetMyUser' | 'canGetUsers';

export const requirePermission = (permission: Permission) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ message: 'User not found' }, 401);
    }

    if (!user.role || !user.role[permission]) {
      return c.json({ message: `Access denied. Required permission: ${permission}` }, 403);
    }

    await next();
  };
};

export const requireAnyPermission = (permissions: Permission[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ message: 'User not found' }, 401);
    }

    if (!user.role) {
      return c.json({ message: 'No role assigned' }, 403);
    }

    const hasPermission = permissions.some(permission => user.role[permission]);
    
    if (!hasPermission) {
      return c.json({ message: `Access denied. Required one of: ${permissions.join(', ')}` }, 403);
    }

    await next();
  };
};
