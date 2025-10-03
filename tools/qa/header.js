/* header.js — © Hardonia. MIT. */
import fs from "fs"; import path from "path";
const exts = new Set([".js",".ts",".json",".md",".html",".yml",".yaml"]);
const banner = (name)=>`/* ${name} — © Hardonia. MIT. */\n`;
function walk(d){
  for (const e of fs.readdirSync(d,{withFileTypes:true})) {
    if (e.name==="node_modules"||e.name===".git"||e.name===".data"||e.name==="dist"||e.name==="logs") continue;
    const p = path.join(d,e.name);
    if (e.isDirectory()) walk(p);
    else {
      const ext = path.extname(p).toLowerCase();
      if (!exts.has(ext)) continue;
      let s = fs.readFileSync(p,"utf8");
      if (!s.startsWith("/* ") && !s.startsWith("<!doctype") && !s.startsWith("#!")) {
        fs.writeFileSync(p, banner(path.basename(p))+s, "utf8");
      }
    }
  }
}
walk(process.cwd());
console.log("header applied");
