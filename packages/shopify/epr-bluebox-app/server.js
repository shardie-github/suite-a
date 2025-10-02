import express from "express";
const app = express();
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
app.use(sentryRequestHandler());
app.use(cspReportOnly);

app.use("/gdpr", gdpr);
app.use(notFound);
app.use(onError);
app.use("/api", api);

app.get("/healthz", (_req,res)=>res.json({ok:true, ts: Date.now()}));
let rq=0; app.use((req,_res,next)=>{ rq++; next(); });
app.get("/metrics", (_req,res)=>res.type("text/plain").send("suitea_requests_total " + rq));

app.post("/csp-report", (req,res)=>{ try{ console.log("CSP:", req.body); }catch{} res.sendStatus(204);});

healthEndpoints(app);
app.use("/oauth", oauth);
app.use(sentryErrorHandler);
app.use(sentryErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log("SuiteA shopify app on :" + port))
  .on('error', (e)=>{ console.error("❌ server listen error", e); process.exit(1); });

app.get("/readyz", (_req,res)=>res.json({ok:true, ts: Date.now()}));
