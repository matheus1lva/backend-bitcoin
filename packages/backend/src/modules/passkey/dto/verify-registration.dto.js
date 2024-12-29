import { z } from 'zod';

const verifyRegistrationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    credential: z.any(),
  }),
});

export default verifyRegistrationSchema;
