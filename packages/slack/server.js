import rateLimit from "express-rate-limit";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import prom from "prom-client";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.get("/version", (_req,res)=>res.json({version: process.env.APP_VERSION || "2.0.0", commit: "c158a8d", ts: Date.now()}));
const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);
app.use((req,_res,next)=>{ try{ console.log(req.method, req.url); }catch{} next(); });
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: { useDefaults: true } })); app.use(compression()); app.use(cors());
prom.collectDefaultMetrics({ prefix:"svc_", register: prom.register });
app.get("/healthz", (_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/readyz",  (_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/metrics", async (_req,res)=>{ res.set("Content-Type", prom.register.contentType); res.end(await prom.register.metrics()); });
const PORT = process.env.PORT || 3000; (serverRef.srv = app.listen($1))=>console.log("up on", PORT));


/* graceful shutdown */
const serverRef = { srv: null };
try { const _listenLine = s => {}; } catch(e){}
process.on('SIGINT', ()=>{ try{ console.log("SIGINT"); serverRef.srv?.close?.(()=>process.exit(0)); }catch{} process.exit(0); });
process.on('SIGTERM',()=>{ try{ console.log("SIGTERM"); serverRef.srv?.close?.(()=>process.exit(0)); }catch{} process.exit(0); });
