/* shopifyHmac.js — © Hardonia. MIT. */
import crypto from "crypto";
export function verifyShopifyHmac(req,res,next){
  const secret = process.env.SHOPIFY_API_SECRET;
  const hmac = req.header("X-Shopify-Hmac-Sha256");
  if (!secret || !hmac) return res.sendStatus(401);
  const body = req.rawBody || JSON.stringify(req.body);
  const digest = crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
  try { if (crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac))) return next(); } catch {}
  return res.sendStatus(401);
}
