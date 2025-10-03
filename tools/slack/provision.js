/* provision.js — © Hardonia. MIT. */
import fs from "fs";
import fetch from "node-fetch";
const token = process.env.SLACK_USER_TOKEN || process.env.SLACK_BOT_TOKEN;
if(!token){ console.log("ℹ️ No SLACK token set; skipping"); process.exit(0); }
const mf = "packages/slack/compliance-bot/slack_manifest.json";
if(!fs.existsSync(mf)){ console.log("ℹ️ No manifest"); process.exit(0); }
const manifest = fs.readFileSync(mf,'utf8');
(async ()=>{
  const r = await fetch("https://slack.com/api/apps.manifest.create", {
    method:"POST",
    headers:{ "Authorization":`Bearer ${token}`, "Content-Type":"application/json; charset=utf-8" },
    body: JSON.stringify({ manifest: JSON.parse(manifest) })
  });
  const j = await r.json();
  console.log("Slack provision resp:", j.ok ? "ok" : j.error || j);
})();
