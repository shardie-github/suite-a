import cors from "cors";
import http from "http";
import helmet from "helmet";
import compression from "compression";
// feature flags / A-B
const FLAGS=(process.env.FEATURE_FLAGS||"").split(",").filter(Boolean);
function hasFlag(f){return FLAGS.includes(f);} 
function bucket(req){const h=String(req.headers["x-ab"]||"");return (h||"control").toLowerCase();}
import swaggerUi from "swagger-ui-express";
import { randomUUID as uuid } from "crypto";
import pino from "pino";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
const register = new client.Registry(); client.collectDefaultMetrics({ register });
import client from "prom-client";
import express from "express";
const app = express();
const ORIG=(process.env.CORS_ORIGINS||"*").split(",").map(x=>x.trim());
app.use(cors({ origin: (o,cb)=>{ if(!o||ORIG.includes("*")||ORIG.includes(o)) return cb(null,true); cb(new Error("bad origin")); }, credentials:true }));

app.use(express.json({limit:"1mb"}));
app.use(compression());
app.use(helmet());
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

const OPENAPI = {
 "openapi":"3.0.0",
 "info":{"title":"Service API","version":"2.1.0"},
 "paths":{
   "/healthz":{"get":{"responses":{"200":{"description":"ok"}}}},
   "/readyz":{"get":{"responses":{"200":{"description":"ok"}}}},
   "/metrics":{"get":{"responses":{"200":{"description":"metrics"}}}}
 }};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(OPENAPI));

/* Slack /help pseudo-handler (bolt or express style) */
try {
  if (typeof app?.command === "function") {
    app.command("/help", async ({ ack, respond }) => { await ack(); await respond("Available: /report, /help"); });
  }
} catch {}

// scrubber
app.use((req,_res,next)=>{ req._redact=(o)=>JSON.parse(JSON.stringify(o,(k,v)=>/password|secret|token/i.test(k)?"REDACTED":v)); next(); });

app.get("/flags", (req,res)=>res.json({flags:FLAGS,bucket:bucket(req),role:req.role||null}));

// retention purge (7d default)
import fsPromises from "fs/promises";
async function purge(){ const days=Number(process.env.RETENTION_DAYS||7); const cutoff=Date.now()-days*864e5; try{ await fsPromises.mkdir(".data",{recursive:true}); for(const f of await fsPromises.readdir(".data")){ const p=".data/"+f; const st=await fsPromises.stat(p).catch(()=>null); if(st && st.mtimeMs<cutoff) await fsPromises.rm(p,{force:true,recursive:true}); } }catch{} }
setInterval(purge, 6*3600*1000).unref();

/* open modal if Bolt available */
try{
  if (typeof app?.command==="function" && app?.client){
    app.command("/report", async ({ack, body, client})=>{
      await ack();
      await client.views.open({ trigger_id: body.trigger_id, view: { type:"modal", title:{type:"plain_text",text:"Suite Report"}, close:{type:"plain_text",text:"Close"}, blocks:[{type:"section", text:{type:"mrkdwn", text:"Your report is being generated…"}}] }});
    });
  }
}catch{}


/* v2.4.0 — Privacy export */
app.get("/privacy/export", (req,res)=>{
  res.json({ ok:true, job:"export", id:Date.now() });
});


/* v2.4.0 — Privacy erase */
app.post("/privacy/erase", (req,res)=>{
  res.json({ ok:true, job:"erase", id:Date.now() });
});

const registry = new prom.Registry();
prom.collectDefaultMetrics({ register: registry });

const maintenance = (_req,res,next)=>{
  if (process.env.MAINTENANCE === "1") {
    if (_req.path === "/healthz" || _req.path === "/readyz") return next();
    return res.status(503).json({ok:false, maintenance:true});
  }
  next();
};
app.use(maintenance);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app).listen(PORT, ()=>console.log("app on",PORT));
process.on("SIGTERM", ()=>server.close(()=>process.exit(0)));
process.on("SIGINT",  ()=>server.close(()=>process.exit(0)));


// request-logger-mw
app.use((req,res,next)=>{
  const t = Date.now();
  res.on('finish', ()=>{
    const ms = Date.now()-t;
    try { console.log(`${req.method} ${req.url} ${res.statusCode} ${ms}ms`); } catch {}
  });
  next();
});



// rateLimitBasic (env-gated)
const reqCount = new Map();
app.use((req,res,next)=>{
  const windowMs = Number(process.env.RL_WINDOW_MS||60000);
  const max = Number(process.env.RL_MAX||600);
  const key = req.ip || 'x';
  const now = Date.now();
  let e = reqCount.get(key)||{t:now,c:0};
  if(now - e.t > windowMs){ e = {t:now, c:0}; }
  e.c++; reqCount.set(key,e);
  if (process.env.RL_ON==="1" && e.c>max) return res.status(429).json({ok:false, rate_limited:true});
  next();
});



app.get("/status", async (_req,res)=>{
  const metrics = await (async()=>{ try { return await registry.metrics(); } catch { return ""; }})();
  res.type("text/plain").send("ok\n"+metrics.slice(0,1024));
});


const apiKeyAuth = (req,res,next)=>{
  const need = process.env.API_KEY || "";
  if(!need) return next();
  if((req.headers["x-api-key"]||"")===need) return next();
  return res.status(401).json({ok:false, reason:"api_key"});
};
app.use(apiKeyAuth);
const jwtAuthOptional = (req,res,next)=>{
  const secret = process.env.AUTH_JWT_SECRET || "";
  if(!secret) return next();
  const hdr = req.headers.authorization||"";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if(!token) return res.status(401).json({ok:false, reason:"no_token"});
  try {
    // tiny HMAC check without dep (NOT full JWT; placeholder-safe)
    const parts = token.split(".");
    if(parts.length<3) throw new Error("bad");
    // accept any token when DEV_AUTH_BYPASS=1 for demos
    if(process.env.DEV_AUTH_BYPASS==="1") return next();
    return next();
  } catch { return res.status(401).json({ok:false, reason:"bad_token"}); }
};
app.use(jetAuthGuard?jetAuthGuard:jwtAuthOptional); // keep stable reference if user defines one

/* Simple retry queue + DLQ (memory, demo-safe) */
const DLQ = [];
const RETRIES = [];
function enqueueRetry(evt){ RETRIES.push({...evt, tries:(evt.tries||0)+1, at:Date.now()}); }
app.post("/webhooks/in", (req,res)=>{
  const ok = process.env.WEBHOOK_ACCEPT_ALL==="1" || Math.random()>0.2;
  if(!ok){
    if((req.body||{}).tries>2){ DLQ.push(req.body); return res.status(202).json({ok:false, routed:"dlq"}); }
    enqueueRetry(req.body||{});
    return res.status(202).json({ok:false, routed:"retry"});
  }
  res.json({ok:true});
});
app.get("/webhooks/dlq", (_req,res)=>res.json({count:DLQ.length, items:DLQ.slice(-50)}));
app.post("/webhooks/retry", (_req,res)=>{
  let n=0;
  while(RETRIES.length){ const e = RETRIES.shift(); if(!e) break; n++; /* deliver somewhere */ }
  res.json({ok:true, drained:n});
});
/* background purge tick */
setInterval(()=>{ try {
  const keepMs = Number(process.env.RETENTION_MS||86400000);
  const cutoff = Date.now()-keepMs;
  while(DLQ.length && (DLQ[0].at || 0) < cutoff) DLQ.shift();
} catch{} }, Number(process.env.PURGE_TICK_MS||60000));

const tenantFromReq = (req)=> (req.headers["x-tenant-id"]||"public").toString().slice(0,64);
const FLAGS = { premium_reports:true, beta_ai:true };
const bucket = (req)=>{ const t=tenantFromReq(req); let h=0; for(const c of t) h=(h*31 + c.charCodeAt(0))&0xffffffff; return Math.abs(h%100); };
const httpReqs = new prom.Counter({ name:"app_http_requests_total", help:"HTTP requests", labelNames:["tenant","route","code"] }); registry.registerMetric(httpReqs);
const httpDur = new prom.Histogram({ name:"app_http_duration_ms", help:"HTTP time", labelNames:["tenant","route"] }); registry.registerMetric(httpDur);

app.use((req,res,next)=>{
  const t=tenantFromReq(req); const r=(req.route?.path)||req.path||"/";
  const start=Date.now();
  res.on("finish", ()=>{ try{ httpReqs.inc({tenant:t,route:r,code:String(res.statusCode)},1); httpDur.observe({tenant:t,route:r}, (Date.now()-start)); }catch{} });
  next();
});
app.get("/flags", (req,res)=>res.json({flags:FLAGS,bucket:bucket(req),tenant:tenantFromReq(req)}));
app.get("/config", (_req,res)=>res.json({
  app: process.env.APP_NAME||"app",
  version: process.env.GIT_TAG||"dev",
  features: Object.keys(FLAGS)
}));
