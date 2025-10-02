import { chromium } from "@playwright/test";
import fs from "fs";
const base = process.env.PUBLIC_URL || "http://localhost:3000";
const outDir = "../../docs/assets";
fs.mkdirSync(outDir, { recursive:true });
const shots = [
  { name:"hero", path:"/reports.html", sel: "body" },
];
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }});
const page = await ctx.newPage();
for(const s of shots){
  await page.goto(base + s.path, { waitUntil:"domcontentloaded" });
  await page.waitForTimeout(600);
  const tgt = s.sel ? await page.locator(s.sel).first() : page;
  await tgt.screenshot({ path: `${outDir}/${s.name}.png` });
  console.log("shot:", s.name);
}
await browser.close();
