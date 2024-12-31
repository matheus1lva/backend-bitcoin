import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { userRouter } from './modules/user/user.routes.js';
import { passKeyRouter } from './modules/passkey/pass-key.routes.js';
import { bitcoinRouter } from './modules/bitcoin/bitcoin.routes.js';
import { plaidRouter } from './modules/plaid/plaid.routes.js';
import {
  jsonParserMiddleware,
  urlencodedMiddleware,
  loggerMiddleware,
} from './middleware';

const app = express();

// CORS configuration before session to handle preflight requests
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// Body parsing middleware before session
app.use(jsonParserMiddleware);
app.use(urlencodedMiddleware);

// Session middleware configuration
app.use(
  session({
    name: 'passkey.sid',
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: process.env.NODE_ENV === 'production', // Trust proxy in production
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      path: '/',
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.COOKIE_DOMAIN
          : undefined,
    },
  }),
);

// Logger middleware after session
app.use(loggerMiddleware);

// API routes
const v1Router = express.Router();
app.use('/v1', v1Router);

v1Router.use('/users', userRouter);
v1Router.use('/passkey', passKeyRouter);
v1Router.use('/bitcoin', bitcoinRouter);
v1Router.use('/payment', plaidRouter);

// Session check middleware (optional, for debugging)
app.use((req, res, next) => {
  if (!req.session) {
    return next(new Error('Session not available'));
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong!'
        : err.message,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
