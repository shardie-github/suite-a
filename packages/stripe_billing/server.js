import express from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";

const app = express(); app.use(bodyParser.json());
const stripe = process.env.STRIPE_SECRET ? new Stripe(process.env.STRIPE_SECRET) : null;

app.get("/stripe/ok", (_req,res)=>res.json({ ok:true, stripe: !!stripe }));

app.post("/stripe/checkout", async (req,res)=>{
  if(!stripe) return res.status(501).json({error:"Stripe not configured"});
  const price = process.env.STRIPE_PRICE_ID; // create in dashboard, or use CLI
  if(!price) return res.status(400).json({error:"Missing STRIPE_PRICE_ID"});
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: (process.env.APP_URL || "http://localhost:3000") + "/success",
    cancel_url: (process.env.APP_URL || "http://localhost:3000") + "/cancel"
  });
  res.json({ url: session.url });
});

// Usage recording (metered)
app.post("/stripe/usage", async (req,res)=>{
  if(!stripe) return res.status(501).json({error:"Stripe not configured"});
  const { subscriptionItem, quantity } = req.body || {};
  if(!subscriptionItem || !quantity) return res.status(400).json({error:"Missing subscriptionItem/quantity"});
  const r = await stripe.subscriptionItems.createUsageRecord(subscriptionItem, {
    quantity, action: "increment", timestamp: "now"
  });
  res.json({ ok:true, record: r });
});

// Webhook stub
app.post("/stripe/webhook", bodyParser.raw({type:'application/json'}), (req,res)=>{
  // In production: verify signature with STRIPE_WEBHOOK_SECRET
  console.log("Stripe webhook:", req.headers['stripe-signature'], String(req.body||''));
  res.sendStatus(200);
});

app.listen(3010, ()=>console.log("Stripe billing stub on :3010"));
