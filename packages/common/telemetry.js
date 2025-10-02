import { logger } from "./logger.js";
export function captureError(err, context = {}) {
  // Sentry-compatible shape (shim)
  const evt = {
    message: err?.message || String(err),
    stack: err?.stack,
    level: "error",
    context,
    ts: Date.now()
  };
  logger.error({ evt }, "telemetry.error");
}
export function audit(event, data = {}) {
  logger.info({ event, data, ts: Date.now() }, "audit");
}
