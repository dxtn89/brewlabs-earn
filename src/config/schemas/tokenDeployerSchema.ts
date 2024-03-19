import { z } from "zod";

export const tokenDeployerSchema = z.object({
  tokenName: z
    .string()
    .min(2, { message: "The token name must be at least 2 characters." })
    .max(50, { message: "The token name contains too many characters." }),
  tokenSymbol: z
    .string()
    .min(2, { message: "The token symbol must be more than 2 characters." })
    .max(50, { message: "The token symbol contains too many characters." }),
  tokenImage: z.any(),
  tokenDecimals: z.coerce
    .number()
    .min(1, { message: "You need at least 1 decimals." })
    .max(77, { message: "You can't have more than 77 decimals." }),
  tokenTotalSupply: z.coerce.number().min(100, { message: "You must make more than 100 tokens." }),
  tokenDescription: z.string().max(1000, { message: "The description is too long." }),
  tokenImmutable: z.boolean(),
  tokenRevokeFreeze: z.boolean(),
  tokenRevokeMint: z.boolean(),
  // tokenBurnPercentage: z.string(),
});
