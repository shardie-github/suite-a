#!/usr/bin/env node
import fetch from "node-fetch";

const [,, cmd, ...args] = process.argv;
const BASE = process.env.SUITEA_BASE || "http://localhost:3000";

async function main(){
  if(cmd === "report"){
    const from = args[0] || "2025-01-01";
    const to   = args[1] || "2025-12-31";
    const token = process.env.SUITEA_SESSION_TOKEN;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const r = await fetch(`${BASE}/api/reports?from=${from}&to=${to}`, { headers });
    const t = await r.text();
    console.log(r.status, t);
    return;
  }
  console.log("Usage: suitea report <from> <to>   (env: SUITEA_BASE, SUITEA_SESSION_TOKEN)");
}
main().catch(e=>{ console.error(e); process.exit(1); });
