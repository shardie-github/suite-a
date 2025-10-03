/* security_extra.js — © Hardonia. MIT. */
export function cspReportOnly(req,res,next){
  res.setHeader("Content-Security-Policy-Report-Only",
    "default-src 'self' https: data: blob:; " +
    "script-src 'self' https: 'unsafe-inline'; " +
    "style-src 'self' https: 'unsafe-inline'; " +
    "img-src 'self' https: data:; " +
    "connect-src 'self' https: http://localhost:3000; " +
    "report-uri /csp-report");
  next();
}
export function healthEndpoints(app){
  app.get("/livez", (_req,res)=>res.send("ok"));
  app.get("/readyz", (_req,res)=>res.json({ ok:true, ts:Date.now() }));
}
