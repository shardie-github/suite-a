/* env.js — © Hardonia. MIT. */
import { z } from "zod";
const schema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("production"),
  PORT: z.string().default("3000"),
  SLACK_SIGNING_SECRET: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  SHOPIFY_API_KEY: z.string().optional(),
  SHOPIFY_API_SECRET: z.string().optional(),
  SHOPIFY_SCOPES: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional()
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid env:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
