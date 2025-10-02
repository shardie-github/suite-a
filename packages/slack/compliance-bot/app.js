<<<<<<< HEAD
import { App } from '@slack/bolt'; import dotenv from 'dotenv'; import fetch from 'node-fetch'; dotenv.config();
const app=new App({token:process.env.SLACK_BOT_TOKEN,signingSecret:process.env.SLACK_SIGNING_SECRET});
function args(t){ const p=(t||'').trim().split(/\s+/); return {jur:p[0]||'',since:p[1]||'2025-07-01',until:p[2]||new Date().toISOString().slice(0,10)}; }
app.command('/report', async ({ command, ack, respond })=>{
  await ack(); const {jur,since,until}=args(command.text); const base=process.env.SHOPIFY_HEADLESS_URL||'http://localhost:3000';
  const url=`${base}/api/reports?since=${since}&until=${until}${jur?`&jurisdiction=${jur}`:''}`;
  try{ const r=await fetch(url); const js=await r.json(); const lines=(js.rows||[]).slice(0,10).map(x=>`• *${x.jurisdiction||''}* ${x.material}: ${x.grams}g`).join('\n')||'No data';
    await respond({ text:`*Report* ${jur||'ALL'} ${since}→${until}\n${lines}` }); }catch(e){ await respond('Failed to fetch report.'); }
});
(async()=>{ await app.start(process.env.PORT||3001); console.log('⚡️ Slack /report ready'); })();
=======
console.log('slack app');
>>>>>>> 95bdcb5 (feat: Suite A v3.4.4 sell-ready (docs+ngrok+slack))
