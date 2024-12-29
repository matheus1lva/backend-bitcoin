import { z } from 'zod';

const registrationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    username: z.string(),
  }),
});

export default registrationSchema;
