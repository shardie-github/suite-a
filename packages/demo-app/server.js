// feature flags / A-B
const FLAGS=(process.env.FEATURE_FLAGS||"").split(",").filter(Boolean);
function hasFlag(f){return FLAGS.includes(f);} 
function bucket(req){const h=String(req.headers["x-ab"]||"");return (h||"control").toLowerCase();}
import cron from "node-cron";
import swaggerUi from "swagger-ui-express";
import { randomUUID as uuid } from "crypto";
import pino from "pino";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import prom from "prom-client";
import dotenv from "dotenv";
dotenv.config();
const app = express();
// JWT_MAYBE: verify if public key provided
import { createPublicKey, verify } from "crypto";
const JWT_PEM=process.env.JWT_PUBLIC_PEM||"";
function jwtMaybe(req,res,next){ if(!JWT_PEM) return next(); try{ const auth=String(req.headers.authorization||""); const tok=auth.startsWith("Bearer ")?auth.slice(7):""; if(!tok) return res.status(401).json({error:"no token"}); const parts=tok.split("."); if(parts.length!==3) return res.status(400).json({error:"bad jwt"}); // naive verify: only header.payload against signature with RSA/ES256 left as TODO
 return next(); }catch(e){ return res.status(401).json({error:"invalid jwt"}); }}
app.use(jwtMaybe);

// role guard via x-api-key
const KEYMAP=Object.fromEntries((process.env.API_KEYS||"").split(",").filter(Boolean).map(k=>[k.split(":")[0],k.split(":")[1]||"viewer"]));
app.use((req,res,next)=>{const k=(req.headers["x-api-key"]||"").toString(); if(!Object.keys(KEYMAP).length) return next(); const r=KEYMAP[k]; if(!r) return res.status(401).json({error:"unauthorized"}); req.role=r; next();});

app.get("/version", (_req,res)=>res.json({version: process.env.APP_VERSION || "2.0.0", commit: "c158a8d", ts: Date.now()}));
const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);
/* API key gate (optional) */
app.use((req,res,next)=>{
  const allow=(process.env.API_KEYS||"").split(",").filter(Boolean);
  if(allow.length===0) return next();
  const got = req.headers["x-api-key"] || req.query.api_key;
  if(allow.includes(String(got))) return next();
  res.status(401).json({error:"unauthorized"}); });
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

const OPENAPI = {
 "openapi":"3.0.0",
 "info":{"title":"Service API","version":"2.1.0"},
 "paths":{
   "/healthz":{"get":{"responses":{"200":{"description":"ok"}}}},
   "/readyz":{"get":{"responses":{"200":{"description":"ok"}}}},
   "/metrics":{"get":{"responses":{"200":{"description":"metrics"}}}}
 }};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(OPENAPI));

/* simple JSON backup */
import fsPromises from "fs/promises";
app.get("/backupz", async (_req,res)=>{ try {
  await fsPromises.mkdir("./.data", {recursive:true});
  const path = "./.data/backup_"+Date.now()+".json";
  await fsPromises.writeFile(path, JSON.stringify({ts:Date.now(), ok:true}));
  res.json({ok:true, path});
} catch(e){ res.status(500).json({error:String(e)}) }});

cron.schedule("*/10 * * * *", ()=>{ try { console.log("heartbeat", Date.now()); } catch {} });

app.get("/report.json", (_req,res)=>res.json({rows:[{id:1,status:"ok"}], ts:Date.now()}));

// scrubber
app.use((req,_res,next)=>{ req._redact=(o)=>JSON.parse(JSON.stringify(o,(k,v)=>/password|secret|token/i.test(k)?"REDACTED":v)); next(); });

app.get("/flags", (req,res)=>res.json({flags:FLAGS,bucket:bucket(req),role:req.role||null}));

// retention purge (7d default)
import fsPromises from "fs/promises";
async function purge(){ const days=Number(process.env.RETENTION_DAYS||7); const cutoff=Date.now()-days*864e5; try{ await fsPromises.mkdir(".data",{recursive:true}); for(const f of await fsPromises.readdir(".data")){ const p=".data/"+f; const st=await fsPromises.stat(p).catch(()=>null); if(st && st.mtimeMs<cutoff) await fsPromises.rm(p,{force:true,recursive:true}); } }catch{} }
setInterval(purge, 6*3600*1000).unref();

import fsPromises from "fs/promises";
app.post("/privacy/export", async (req,res)=>{ try{
  await fsPromises.mkdir(".data/privacy",{recursive:true});
  const file=".data/privacy/export_"+Date.now()+".json";
  await fsPromises.writeFile(file, JSON.stringify({user:req.query.user||"unknown",ts:Date.now()}));
  res.json({ok:true,file});
}catch(e){ res.status(500).json({error:String(e)}) }});
app.post("/privacy/erase", async (req,res)=>{ try{
  await fsPromises.mkdir(".data/privacy",{recursive:true});
  const file=".data/privacy/erase_"+Date.now()+".json";
  await fsPromises.writeFile(file, JSON.stringify({user:req.query.user||"unknown",ts:Date.now(),status:"queued"}));
  res.json({ok:true,file});
}catch(e){ res.status(500).json({error:String(e)}) }});

app.get("/billing/portal", (_req,res)=>{
  const url=process.env.CUSTOMER_PORTAL_URL||"";
  if(!url) return res.status(501).json({error:"portal not configured"});
  res.json({url});
});

app.get("/download/report.csv", (_req,res)=>{
  res.set("Content-Type","text/csv");
  res.set("Content-Disposition","attachment; filename=report.csv");
  res.end("id,status\n1,ok\n");
});

app.get("/whoami", (req,res)=>res.json({role:req.role||null, flags:(process.env.FEATURE_FLAGS||"").split(",").filter(Boolean)}));
