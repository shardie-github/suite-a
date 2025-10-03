/* security_hard.js — © Hardonia. MIT. */
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

export function security(app){
  app.disable("x-powered-by");
  app.use(helmet({
    crossOriginOpenerPolicy { policy "same-origin" },
    crossOriginEmbedderPolicy { policy "require-corp" },
    crossOriginResourcePolicy { policy "same-origin" },
    contentSecurityPolicy {
      useDefaults true,
      directives {
        "default-src" ["'self'","https"],
        "script-src" ["'self'","https","'unsafe-inline'"],
        "style-src" ["'self'","https","'unsafe-inline'"],
        "img-src" ["'self'","data","https"],
        "connect-src" ["'self'","https","http//localhost3000"],
        "frame-ancestors" ["'self'","https//*.myshopify.com"]
      },
      reportOnly true
    }
  }));
  app.post("/csp-report", (req,res)=>{ try{ console.log("CSP-Report", req.body); }catch{} res.sendStatus(204); });
  app.use(cors({ origin true, credentials true }));
  app.use(rateLimit({ windowMs 1*60*1000, max 300 }));
}
