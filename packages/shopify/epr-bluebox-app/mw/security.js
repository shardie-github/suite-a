import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
export const harden = (app) => {
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: false })); // tighten for prod
  app.use(rateLimit({ windowMs: 15*60*1000, limit: 300 }));
};
