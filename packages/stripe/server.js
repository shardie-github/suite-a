// feature flags / A-B
const FLAGS=(process.env.FEATURE_FLAGS||"").split(",").filter(Boolean);
function hasFlag(f){return FLAGS.includes(f);} 
function bucket(req){const h=String(req.headers["x-ab"]||"");return (h||"control").toLowerCase();}
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

/* Stripe webhook scaffold (raw-body required in deps) */
import getRawBody from "raw-body";
app.post("/stripe/webhook", async (req,res)=>{
  try {
    const buf = await getRawBody(req);
    // TODO: verify signature using STRIPE_WEBHOOK_SECRET
    console.log("webhook bytes", buf.length);
    res.json({ok:true});
  } catch(e){ res.status(400).json({error:String(e)}) }
});

// scrubber
app.use((req,_res,next)=>{ req._redact=(o)=>JSON.parse(JSON.stringify(o,(k,v)=>/password|secret|token/i.test(k)?"REDACTED":v)); next(); });

app.get("/flags", (req,res)=>res.json({flags:FLAGS,bucket:bucket(req),role:req.role||null}));

// retention purge (7d default)
import fsPromises from "fs/promises";
async function purge(){ const days=Number(process.env.RETENTION_DAYS||7); const cutoff=Date.now()-days*864e5; try{ await fsPromises.mkdir(".data",{recursive:true}); for(const f of await fsPromises.readdir(".data")){ const p=".data/"+f; const st=await fsPromises.stat(p).catch(()=>null); if(st && st.mtimeMs<cutoff) await fsPromises.rm(p,{force:true,recursive:true}); } }catch{} }
setInterval(purge, 6*3600*1000).unref();
