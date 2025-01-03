import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Rate limiting configuration
export const limiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Security headers middleware
export const securityMiddleware = helmet();
