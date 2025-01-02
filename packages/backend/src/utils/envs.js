export const isDev =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
export const isProd = process.env.NODE_ENV === 'production';
