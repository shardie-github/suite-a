const register = new client.Registry(); client.collectDefaultMetrics({ register });
import client from "prom-client";
import express from "express";
const app = express();
/* app.js — © Hardonia. MIT. */
import { verifySlack } from "./mw/verify.js";
import express from "express";
console.log('slack app');

app.get("/metrics", async (_req,res)=>{ res.set("Content-Type", register.contentType); res.end(await register.metrics()); });

app.get("/healthz", (_req,res)=>res.json({ok:true,ts:Date.now()}));

app.get("/readyz",  (_req,res)=>res.json({ok:true,ts:Date.now()}));

const PORT = process.env.PORT || 3001; app.listen(PORT, ()=>console.log("slack up on", PORT));
