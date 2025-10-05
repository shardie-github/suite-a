import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
const router = Router();
const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeKey || "sk_test_dummy", { apiVersion: "2024-06-20" });

router.post("/create-checkout", async (req,res)=>{
  const body = z.object({ orgId: z.string(), priceId: z.string(), success_url: z.string().url(), cancel_url: z.string().url() }).parse(req.body);
  if(!stripeKey) return res.status(500).json({error:"stripe_unconfigured"});
  const session = await stripe.checkout.sessions.create({ mode:"subscription", line_items:[{ price:body.priceId, quantity:1 }], success_url: body.success_url, cancel_url: body.cancel_url });
  await prisma.subscription.upsert({ where:{ orgId: body.orgId }, create:{ orgId: body.orgId, plan:"pro", status:"pending" }, update:{ status:"pending" }});
  res.json({ url: session.url });
});

router.post("/webhook", async (req,res)=>{
  // NOTE: webhook signatures need express.raw; add in index.ts where route is mounted
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if(!secret) return res.status(200).json({ received:true }); // noop in dev
  try{ res.json({ received:true }); } catch(e:any){ return res.status(400).json({error:e.message}); }
});

export default router; export { router };
