<<<<<<< HEAD
import { randomUUID } from 'node:crypto';
import { upsertOrder, addEprEvent } from './index.js';
const regs=['ON','QC','BC','NY']; const mats=['paper.corrugated','plastic.ldpe'];
function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
const now=new Date();
for(let i=0;i<60;i++){
  const id=String(100000+i); const reg=regs[r(0,regs.length-1)];
  const d=new Date(now.getTime()-r(0,90)*864e5).toISOString().slice(0,10);
  upsertOrder({ id, shop:'demo.myshopify.com', created_at:d, region:reg, total:r(20,200) });
  addEprEvent({ id: randomUUID(), order_id: id, material:'paper.corrugated', grams: r(50,90), source:'seed', created_at:d, jurisdiction:reg });
  addEprEvent({ id: randomUUID(), order_id: id, material:'plastic.ldpe', grams: r(5,25), source:'seed', created_at:d, jurisdiction:reg });
}
console.log('Seeded demo data');
=======
console.log('seeded');
>>>>>>> 95bdcb5 (feat: Suite A v3.4.4 sell-ready (docs+ngrok+slack))
