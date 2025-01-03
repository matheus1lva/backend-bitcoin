import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const isDev = process.env.NODE_ENV === 'development';

const customFormat = printf(({ level, message, timestamp, ...keys }) => {
  const keysString =
    Object.keys(keys).length > 0 ? `\n${JSON.stringify(keys, null, 2)}` : '';
  return `${timestamp} [${level}]: ${message}${keysString}`;
});

const getTransports = () => {
  if (isDev) {
    return [
      new winston.transports.Console({
        level: 'http',
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          colorize(),
          customFormat,
        ),
      }),
    ];
  }

  return [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ];
};

const getExceptionHandlers = () => {
  if (isDev) {
    return [new winston.transports.File({ filename: 'logs/exceptions.log' })];
  }
  return [];
};

const getRejectionHandlers = () => {
  if (isDev) {
    return [new winston.transports.File({ filename: 'logs/rejections.log' })];
  }
  return [];
};

export const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format: winston.format.json(),
  transports: getTransports(),
  exceptionHandlers: getExceptionHandlers(),
  rejectionHandlers: getRejectionHandlers(),
});
