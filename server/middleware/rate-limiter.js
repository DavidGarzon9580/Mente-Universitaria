import { ApplicationError } from '../errors/application.error.js';

export function createRateLimiter({ windowMs, maxRequests }) {
  const clients = new Map();

  return function rateLimiter(request, _response, next) {
    const now = Date.now();
    const key = request.ip || 'unknown';
    const current = clients.get(key);

    if (!current || now >= current.resetAt) {
      clients.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= maxRequests) {
      next(new ApplicationError('Espera un momento antes de generar otro plan.', {
        statusCode: 429,
        code: 'RATE_LIMITED'
      }));
      return;
    }

    current.count += 1;
    next();
  };
}
