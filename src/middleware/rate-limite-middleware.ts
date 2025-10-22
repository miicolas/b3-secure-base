import type{ Context, Next } from 'hono';

const rateLimitAttempts = new Map<string, number>();
const RATE_LIMIT_WINDOW = 5000;

export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const body = await c.req.json();
  const email = body?.email;

  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  const now = Date.now();
  const lastAttempt = rateLimitAttempts.get(email);

  if (lastAttempt && (now - lastAttempt) < RATE_LIMIT_WINDOW) {
    const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000);
    return c.json(
      { 
        error: 'Too many login attempts. Please try again later.',
        retryAfter: remainingTime
      }, 
      429
    );
  }

  rateLimitAttempts.set(email, now);


  const cutoffTime = now - RATE_LIMIT_WINDOW;
  for (const [storedEmail, timestamp] of rateLimitAttempts.entries()) {
    if (timestamp < cutoffTime) {
      rateLimitAttempts.delete(storedEmail);
    }
  }

  await next();
};
