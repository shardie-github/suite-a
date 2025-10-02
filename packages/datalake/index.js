import fs from 'node:fs';
let mode='better'; let db, driver;
try{
  const Database = (await import('better-sqlite3')).default;
  if(!fs.existsSync('.data')) fs.mkdirSync('.data',{recursive:true});
  db = new Database('.data/suitea.db');
}catch(e){
  mode='cli'; driver = await import('./driver.js');
}
function init(){
  const schema = `
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, shop TEXT, created_at TEXT, region TEXT, total REAL);
    CREATE TABLE IF NOT EXISTS epr_events (
      id TEXT PRIMARY KEY, order_id TEXT, material TEXT, grams INTEGER,
      source TEXT, created_at TEXT, jurisdiction TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop);
    CREATE INDEX IF NOT EXISTS idx_events_order ON epr_events(order_id);
    CREATE INDEX IF NOT EXISTS idx_events_jur ON epr_events(jurisdiction);
  `;
  if(mode==='better') db.exec(schema); else driver.run(schema);
}
init();
export function upsertOrder(o){
  const sql = `INSERT OR REPLACE INTO orders(id,shop,created_at,region,total)
    VALUES('${o.id}','${o.shop}','${o.created_at}','${o.region}',${Number(o.total)||0})`;
  if(mode==='better') db.prepare(sql).run(); else driver.run(sql);
}
export function addEprEvent(e){
  const sql = `INSERT OR REPLACE INTO epr_events(id,order_id,material,grams,source,created_at,jurisdiction)
    VALUES('${e.id}','${e.order_id}','${e.material}',${Number(e.grams)||0},'${e.source}','${e.created_at}','${e.jurisdiction||''}')`;
  if(mode==='better') db.prepare(sql).run(); else driver.run(sql);
}
export function rangeTotals({since,until,jurisdiction}){
  let q = `SELECT jurisdiction, material, SUM(grams) as grams FROM epr_events
           WHERE date(created_at) BETWEEN date('${since}') AND date('${until}')`;
  if(jurisdiction) q += ` AND jurisdiction='${jurisdiction}'`;
  q += ` GROUP BY jurisdiction, material ORDER BY jurisdiction, material`;
  if(mode==='better') return db.prepare(q).all();
  return driver.all(q);
}
export default null;
