import http from "http";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import prom from "prom-client";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json({limit:"1mb"}));
app.disable("x-powered-by");
app.use(helmet()); app.use(compression()); app.use(cors());
prom.collectDefaultMetrics({ prefix:"svc_", register: prom.register });
app.get("/healthz", (_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/readyz",  (_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/metrics", async (_req,res)=>{ res.set("Content-Type", prom.register.contentType); res.end(await prom.register.metrics()); });
const PORT = process.env.PORT || 3000; app.listen(PORT, ()=>console.log("up on", PORT));

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

const VERSION = process.env.GIT_TAG || "dev"; const COMMIT = process.env.GIT_COMMIT || ""; const APP_NAME = process.env.APP_NAME || "app";
app.get("/version", (_req,res)=>res.json({app:APP_NAME, version:VERSION, commit:COMMIT}));

const PORT = process.env.PORT || 3000;
const server = http.createServer(app).listen(PORT, ()=>console.log("app on",PORT));
process.on("SIGTERM", ()=>server.close(()=>process.exit(0)));
process.on("SIGINT",  ()=>server.close(()=>process.exit(0)));
