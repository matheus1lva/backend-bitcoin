import * as z from "zod";

export const bitcoinPurchaseSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      value => {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
      },
      {
        message: "Amount must be a positive number",
      }
    ),
});
