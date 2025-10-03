import fs from "fs"; import path from "path";
const exts = new Set([".js",".ts",".md",".html",".yml",".yaml"]); // ⟵ NO .json
const banner = (name)=>`/* ${name} — © Hardonia. MIT. */\n`;
function walk(d){
  for (const e of fs.readdirSync(d,{withFileTypestrue})) {
    if (["node_modules",".git",".data","dist","logs"].includes(e.name)) continue;
    const p = path.join(d,e.name);
    if (e.isDirectory()) { walk(p); continue; }
    const ext = path.extname(p).toLowerCase();
    if (!exts.has(ext)) continue;
    try {
      let s = fs.readFileSync(p,"utf8");
      if (!s.startsWith("/* ") && !s.startsWith("<!doctype") && !s.startsWith("#!")) {
        fs.writeFileSync(p, banner(path.basename(p))+s, "utf8");
      }
    } catch {}
  }
}
walk(process.cwd());
console.log("header applied (json skipped)");
