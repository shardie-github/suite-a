import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import client from "prom-client";
import health from "./routes/health.js";
import auth from "./routes/auth.js";
import flags from "./routes/flags.js";
import org from "./routes/org.js";
import billing from "./routes/billing.js";

const specs = { openapi:"3.1.0", info:{ title:"Suite API", version:"1.0.0" } };

const app = express();
const logger = pino({ transport: { target: "pino-pretty" } });
app.use(pinoHttp({ logger }));
app.use(helmet({ contentSecurityPolicy:false, crossOriginOpenerPolicy:{ policy:"same-origin-allow-popups" } }));
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "512kb" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));

// Metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });
app.get("/metrics", async (_req,res) => { res.set("Content-Type", register.contentType); res.end(await register.metrics()); });

// Routes
app.get("/", (_req, res) => res.json({ ok:true, service:"api" }));
app.use("/health", health);
app.use("/auth", auth);
app.use("/flags", flags);
app.use("/org", org);
app.use("/billing", express.raw({type:"application/json"}), billing);

// Error handler
app.use((err:any,_req:any,res:any,_next:any)=>{ const code=err.status||500; res.status(code).json({ error: err.message || "server_error" }); });

// Security nudge
if((process.env.JWT_SECRET||"dev_secret_change_me")==="dev_secret_change_me"){ console.warn("[SECURITY] Change JWT_SECRET"); }

const port = Number(process.env.PORT || 4000);
app.listen(port, () => { logger.info("API listening on http://127.0.0.1:" + port); });
