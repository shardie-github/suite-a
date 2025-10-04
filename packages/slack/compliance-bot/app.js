import rateLimit from "express-rate-limit";
const register = new client.Registry(); client.collectDefaultMetrics({ register });
import client from "prom-client";
import express from "express";
const app = express();
app.get("/version", (_req,res)=>res.json({version: process.env.APP_VERSION || "2.0.0", commit: "c158a8d", ts: Date.now()}));
const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);
app.use((req,_res,next)=>{ try{ console.log(req.method, req.url); }catch{} next(); });
/* app.js — © Hardonia. MIT. */
import { verifySlack } from "./mw/verify.js";
import express from "express";
console.log('slack app');

app.get("/metrics", async (_req,res)=>{ res.set("Content-Type", register.contentType); res.end(await register.metrics()); });

app.get("/healthz", (_req,res)=>res.json({ok:true,ts:Date.now()}));

app.get("/readyz",  (_req,res)=>res.json({ok:true,ts:Date.now()}));

const PORT = process.env.PORT || 3001; (serverRef.srv = app.listen($1))=>console.log("slack up on", PORT));


/* graceful shutdown */
const serverRef = { srv: null };
try { const _listenLine = s => {}; } catch(e){}
process.on('SIGINT', ()=>{ try{ console.log("SIGINT"); serverRef.srv?.close?.(()=>process.exit(0)); }catch{} process.exit(0); });
process.on('SIGTERM',()=>{ try{ console.log("SIGTERM"); serverRef.srv?.close?.(()=>process.exit(0)); }catch{} process.exit(0); });
