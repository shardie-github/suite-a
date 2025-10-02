import fs from "fs"; import path from "path";
const STORE = path.resolve(process.cwd(), ".data/offline_tokens.json");
export function getOfflineToken(shop){
  try{ return JSON.parse(fs.readFileSync(STORE,"utf8"))[shop] || null; }catch{return null;}
}
export function setOfflineToken(shop, token){
  const dir = path.dirname(STORE); fs.mkdirSync(dir,{recursive:true});
  let j={}; try{ j=JSON.parse(fs.readFileSync(STORE,"utf8")); }catch{}
  j[shop]=token; fs.writeFileSync(STORE, JSON.stringify(j,null,2));
}
