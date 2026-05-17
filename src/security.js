const rateLimit = require('express-rate-limit');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts' },
  skipSuccessfulRequests: true,
});

const blockedIPs = new Set();
const failedAttempts = new Map();

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
};

const ipProtection = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (blockedIPs.has(ip)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  next();
};

const trackFailedAttempt = (ip) => {
  const attempts = (failedAttempts.get(ip) || 0) + 1;
  failedAttempts.set(ip, attempts);
  if (attempts >= 10) {
    blockedIPs.add(ip);
    setTimeout(() => {
      blockedIPs.delete(ip);
      failedAttempts.delete(ip);
    }, 60 * 60 * 1000);
  }
};

const validateRequest = (req, res, next) => {
  const suspicious = ['<script', 'javascript:', '../', 'DROP TABLE', 'SELECT *'];
  const body = JSON.stringify(req.body || {}).toLowerCase();
  for (const pattern of suspicious) {
    if (body.includes(pattern.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid request.' });
    }
  }
  next();
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = (process.env.ALLOWED_ORIGINS || '*').split(',');
    if (!origin || allowed.includes('*') || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID'],
};

const auditLog = (action) => (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      console.error('[SECURITY]', JSON.stringify({
        timestamp: new Date().toISOString(),
        action, method: req.method, path: req.path,
        ip: req.ip, status: res.statusCode,
        duration: Date.now() - start,
      }));
    }
  });
  next();
};

module.exports = {
  apiLimiter, authLimiter, securityHeaders,
  ipProtection, validateRequest, corsOptions,
  auditLog, trackFailedAttempt,
};