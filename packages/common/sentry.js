/* sentry.js — © Hardonia. MIT. */
import * as Sentry from "@sentry/node";
let inited=false;
export function initSentry(){
  if(inited) return;
  const dsn = process.env.SENTRY_DSN;
  if(!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_RATE||0.1),
    environment: process.env.NODE_ENV||"production"
  });
  inited=true;
}
export function sentryRequestHandler(){ return (req,res,next)=>{ try{ initSentry(); Sentry.setupExpressErrorHandler?.(); }catch{} next(); }; }
export function sentryErrorHandler(err,req,res,next){ try{ initSentry(); Sentry.captureException(err); }catch{} next(err); }
