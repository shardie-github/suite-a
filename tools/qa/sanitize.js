/* sanitize.js — © Hardonia. MIT. */
import fs from "fs"; import path from "path";
const roots = ["packages","tools","docs","README.md",".github"];
const ban = [
  //gi, /AI[- ]?(assistant|generated)/gi, //gi,
  //gi, //gi, //gi,
  /[:]?/g, /[:]?/g, /||/g
];
function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) {
  if (e.name==="node_modules"||e.name===".git"||e.name===".data"||e.name==="dist"||e.name==="logs") continue;
  const p = path.join(d,e.name);
  if (e.isDirectory()) walk(p);
  else {
    try {
      let s = fs.readFileSync(p,"utf8"); let t = s;
      for (const r of ban) t = t.replace(r,"");
      t = t.replace(/\n{3,}/g,"\n\n");
      if (t!==s) fs.writeFileSync(p,t,"utf8");
    } catch {}
  }
}}
for (const r of roots) if (fs.existsSync(r)) (fs.lstatSync(r).isDirectory()?walk(r):(()=>{let s=fs.readFileSync(r,"utf8"); for(const b of ban) s=s.replace(b,""); fs.writeFileSync(r,s)})());
console.log("sanitize done");
