import { z } from 'zod';

const verifyAuthenticationSchema = z.object({
  body: z.object({
    credential: z.any(),
  }),
});

export default verifyAuthenticationSchema;
