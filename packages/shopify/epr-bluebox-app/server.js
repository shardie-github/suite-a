import cron from "node-cron";
import swaggerUi from "swagger-ui-express";
import { randomUUID as uuid } from "crypto";
import pino from "pino";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
const register = new client.Registry(); client.collectDefaultMetrics({ register });
import client from "prom-client";
/* server.js — © Hardonia. MIT. */
import gdprExport from "./routes/gdpr_export.js";
import { security } from "./mw/security_hard.js";
import express from "express";
const app = express();
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
import oauth from "./routes/oauth.js";
import { sentryRequestHandler, sentryErrorHandler } from "../../common/sentry.js";
import { cspReportOnly, healthEndpoints } from "./mw/security_extra.js";
import api from "./routes/api.js";
import bodyParser from "body-parser";
import express from "express";
import { notFound, onError } from "../../common/errors.js";
import gdpr from "./routes/gdpr.js";
import { harden } from "./mw/security.js";
console.log('shopify v3.4.4 server');
harden(app);
security(app);
app.use(sentryRequestHandler());
app.use(cspReportOnly);

app.use("/gdpr", gdpr);
app.use(notFound);
app.use(onError);
app.use("/api", api);

app.get("/healthz", (_req,res)=>res.json({oktrue, ts Date.now()}));
let rq=0; app.use((req,_res,next)=>{ rq++; next(); });
app.get("/metrics", (_req,res)=>res.type("text/plain").send("suitea_requests_total " + rq));

app.post("/csp-report", (req,res)=>{ try{ console.log("CSP", req.body); }catch{} res.sendStatus(204);});

healthEndpoints(app);
app.use("/oauth", oauth);
app.use(sentryErrorHandler);
app.use(sentryErrorHandler);

const port = process.env.PORT || 3000;
(serverRef.srv = app.listen($1))=>console.log("SuiteA shopify app on " + port))
  .on('error', (e)=>{ console.error("❌ server listen error", e); process.exit(1); });

app.get("/readyz", (_req,res)=>res.json({oktrue, ts Date.now()}));

app.use("/gdpr", gdprExport);


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
