import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import {
  jsonParserMiddleware,
  urlencodedMiddleware,
  loggerMiddleware,
  securityMiddleware,
  limiterMiddleware,
} from './middleware';
import { logger } from './utils/logger';
import { userRouter } from './modules/user/user.routes.js';
import { passKeyRouter } from './modules/passkey/pass-key.routes.js';
import { bitcoinRouter } from './modules/bitcoin/bitcoin.routes.js';
import { plaidRouter } from './modules/plaid/plaid.routes.js';

const isDev = process.env.NODE_ENV !== 'production';

export const app = express();

// Security headers
app.use(securityMiddleware);

// Apply rate limiting to all routes
app.use(limiterMiddleware);

// CORS configuration
app.use(
  cors({
    origin: isDev ? 'http://localhost:5173' : process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// Body parsing middleware
app.use(jsonParserMiddleware);
app.use(urlencodedMiddleware);

// Session configuration
const sessionConfig = {
  name: 'passkey.sid',
  secret: process.env.SESSION_SECRET || (isDev ? 'dev-secret' : undefined),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: !isDev,
  cookie: {
    secure: !isDev,
    sameSite: isDev ? 'lax' : 'none',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    path: '/',
    domain: isDev ? undefined : process.env.COOKIE_DOMAIN,
  },
};

if (!sessionConfig.secret) {
  throw new Error('SESSION_SECRET must be set in production');
}

app.use(session(sessionConfig));

// Request logging
app.use(loggerMiddleware);

// API routes
const v1Router = express.Router();
app.use('/v1', v1Router);

v1Router.use('/users', userRouter);
v1Router.use('/passkey', passKeyRouter);
v1Router.use('/bitcoin', bitcoinRouter);
v1Router.use('/payment', plaidRouter);

// Session check middleware
app.use((req, res, next) => {
  if (!req.session) {
    const error = new Error('Session not available');
    error.status = 500;
    return next(error);
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = isDev ? err.message : 'Something went wrong!';

  // Log error details
  logger.error('Error handling request', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    status,
  });

  res.status(status).json({
    status: 'error',
    message,
    ...(isDev && { stack: err.stack }),
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});
