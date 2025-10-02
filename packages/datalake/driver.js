<<<<<<< HEAD
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
export const dbPath = '.data/suitea.db';
function ensure(){ if(!fs.existsSync('.data')) fs.mkdirSync('.data',{recursive:true}); }
export function run(sql){
  ensure();
  const res = spawnSync('sqlite3', [dbPath, sql], { encoding: 'utf8' });
  if(res.status!==0) throw new Error(res.stderr||'sqlite3 exec failed');
  return res.stdout;
}
export function all(sql){
  ensure();
  const res = spawnSync('sqlite3', [dbPath, '.mode csv', '.headers on', sql], { encoding:'utf8' });
  if(res.status!==0) throw new Error(res.stderr||'sqlite3 exec failed');
  const lines = res.stdout.trim().split(/\r?\n/).filter(Boolean);
  if(lines.length===0) return [];
  const header = lines[0].split(',');
  return lines.slice(1).map(l=>{
    const cols=l.split(','); const row={};
    header.forEach((h,i)=>{ const v=cols[i]; row[h]= (v!==undefined && v!=='' && !isNaN(Number(v)))?Number(v):v; });
    return row;
  });
}
=======
export const dbPath = '.data/suitea.db';
>>>>>>> 95bdcb5 (feat: Suite A v3.4.4 sell-ready (docs+ngrok+slack))
