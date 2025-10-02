import fs from "fs"; import path from "path";
const outDir = "docs/submission"; fs.mkdirSync(outDir,{recursive:true});
const files = [
  "docs/LISTING_COPY.md",
  "docs/PRIVACY_POLICY.md",
  "docs/TERMS.md",
  "docs/SHOPIFY_SETUP.md",
  "docs/SLACK_SETUP.md",
  "docs/INSTALL_GUIDE.md",
  "docs/api/openapi.yaml",
  "packages/slack/compliance-bot/slack_manifest.json"
].filter(f=>fs.existsSync(f));
for(const f of files){
  const dest = path.join(outDir, path.basename(f));
  fs.copyFileSync(f, dest);
}
if (fs.existsSync("docs/assets/hero.png")) fs.copyFileSync("docs/assets/hero.png", path.join(outDir, "hero.png"));
console.log("✅ Submission pack assembled to", outDir);
