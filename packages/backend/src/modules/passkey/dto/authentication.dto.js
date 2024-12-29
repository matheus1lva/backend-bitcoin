import { z } from 'zod';

const authenticationSchema = z.object({
  body: z.object({
    username: z.string(),
  }),
});

export default authenticationSchema;
