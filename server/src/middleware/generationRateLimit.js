function createRateLimiter({ windowMs, limit, action }) {
  const requestsByClient = new Map();

  return function rateLimit(request, _response, next) {
    const now = Date.now();
    for (const [client, record] of requestsByClient) {
      if (now - record.startedAt >= windowMs) requestsByClient.delete(client);
    }

    const clientId = request.ip || request.socket.remoteAddress || 'unknown';
    let record = requestsByClient.get(clientId);
    if (!record || now - record.startedAt >= windowMs) {
      record = { startedAt: now, count: 0 };
      requestsByClient.set(clientId, record);
    }

    if (record.count >= limit) {
      const error = new Error(`Too many ${action} requests. Please try again later.`);
      error.status = 429;
      error.code = 'RATE_LIMITED';
      next(error);
      return;
    }

    record.count += 1;
    next();
  };
}

const tenMinutes = 10 * 60 * 1000;
export const generationRateLimit = createRateLimiter({
  windowMs: tenMinutes,
  limit: 10,
  action: 'generation',
});
export const hintRateLimit = createRateLimiter({
  windowMs: tenMinutes,
  limit: 30,
  action: 'hint',
});
