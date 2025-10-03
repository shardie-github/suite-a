/* verify.js — © Hardonia. MIT. */
import crypto from "crypto";
export function verifySlack(req,res,next){
  const ts = req.headers["x-slack-request-timestamp"];
  const sig = req.headers["x-slack-signature"];
  const secret = process.env.SLACK_SIGNING_SECRET;
  if(!ts || !sig || !secret) return res.sendStatus(401);
  if (Math.abs(Date.now()/1000 - Number(ts)) > 300) return res.sendStatus(401);
  const [ver,hash] = sig.split("=");
  const base = `${ver}:${ts}:${req.rawBody || JSON.stringify(req.body)}`;
  const calc = crypto.createHmac("sha256", secret).update(base).digest("hex");
  try { if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(calc))) return next(); } catch {}
  return res.sendStatus(401);
}
