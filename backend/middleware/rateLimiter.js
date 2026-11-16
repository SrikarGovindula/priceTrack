// Lightweight in-memory rate limiter using sliding token bucket
const requestCounts = new Map();

function rateLimiter({ windowMs = 60000, maxRequests = 100 } = {}) {
  // Periodically cleanup expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (now - value.startTime > windowMs) {
        requestCounts.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const entry = requestCounts.get(ip);
    if (!entry || (now - entry.startTime > windowMs)) {
      requestCounts.set(ip, { startTime: now, count: 1 });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down and try again shortly.'
      });
    }

    entry.count++;
    next();
  };
}

module.exports = {
  rateLimiter
};
