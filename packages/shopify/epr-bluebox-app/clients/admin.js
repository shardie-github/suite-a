import fetch from "node-fetch";
export class ShopifyAdmin {
  constructor({ shop, accessToken }) { this.shop = shop; this.accessToken = accessToken; }
  async get(path){ return this.#call("GET", path); }
  async post(path, body){ return this.#call("POST", path, body); }
  async #call(method, path, body){
    const url = `https://${this.shop}/admin/api/2024-10${path}`;
    const res = await fetch(url, {
      method, headers: {
        "X-Shopify-Access-Token": this.accessToken,
        "Content-Type":"application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if(!res.ok){ const t = await res.text(); throw new Error(`Shopify ${method} ${path} ${res.status}: ${t}`); }
    return res.json();
  }
}
export async function exchangeSessionForAdminToken(sessionJwt){
  // TODO: Implement per your OAuth/storage. For now, read from ENV for dev
  const shop = process.env.SHOPIFY_SHOP_DOMAIN; // e.g., hardonia.myshopify.com
  const accessToken = process.env.SHOPIFY_ADMIN_TOKEN; // Dev/private token for local testing
  if(!shop || !accessToken) throw new Error("Admin token not configured");
  return { shop, accessToken };
}
