import express from 'express';

export const jsonParserMiddleware = express.json({ limit: '1mb' });
export const urlencodedMiddleware = express.urlencoded({
  extended: true,
  limit: '1mb',
});
