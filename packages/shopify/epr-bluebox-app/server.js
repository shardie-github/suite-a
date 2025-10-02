import express from 'express'; import dotenv from 'dotenv'; import helmet from 'helmet'; import compression from 'compression';
import rateLimit from 'express-rate-limit'; import { rangeTotals } from '../../datalake/index.js';
dotenv.config();
const app=express();
app.disable('x-powered-by'); app.use(compression()); app.use(helmet());
app.use(express.json()); app.use(rateLimit({windowMs:60_000,max:120}));
app.use(express.static('public'));
app.get('/health', (_q,res)=>res.json({ok:true}));
app.get('/api/reports', (req,res)=>{
  const since=req.query.since||'2025-07-01'; const until=req.query.until||new Date().toISOString().slice(0,10); const jurisdiction=req.query.jurisdiction||null;
  res.json({since,until,jurisdiction,rows:rangeTotals({since,until,jurisdiction})});
});
app.get('/reports.csv', (req,res)=>{
  const since=req.query.since||'2025-07-01'; const until=req.query.until||new Date().toISOString().slice(0,10); const jurisdiction=req.query.jurisdiction||null;
  const rows = rangeTotals({since,until,jurisdiction});
  const header='jurisdiction,material,grams\n'; const body=rows.map(r=>[r.jurisdiction||'',r.material,r.grams].join(',')).join('\n');
  res.setHeader('Content-Type','text/csv'); res.setHeader('Content-Disposition','attachment; filename=report.csv'); res.send(header+body);
});
app.get('/', (_q,res)=>res.redirect('/reports.html'));
const port=process.env.PORT||3000; app.listen(port, ()=>console.log('shopify v3.4.3 :'+port));
