import { z } from 'zod';
export const exchangeTokenSchema = z.object({
  public_token: z.string(),
});
