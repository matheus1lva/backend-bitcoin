import { logger } from '../utils/logger';
import morgan from 'morgan';

export const loggerMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => {
        logger.http(message);
      },
    },
  },
);
