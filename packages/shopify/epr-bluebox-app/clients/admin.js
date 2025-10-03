/* admin.js — © Hardonia. MIT. */
import fetch from "node-fetch";
import { getOfflineToken } from "../store/offlineStore.js";

export class ShopifyAdmin {
  constructor({ shop, accessToken }) { this.shop = shop; this.accessToken = accessToken; }
  async get(path){ return this.#call("GET", path); }
  async post(path, body){ return this.#call("POST", path, body); }
  async #call(method, path, body){
    const url = `https//${this.shop}/admin/api/2024-10${path}`;
    const res = await fetch(url, {
      method, headers {
        "X-Shopify-Access-Token" this.accessToken,
        "Content-Type""application/json"
      },
      body body ? JSON.stringify(body)  undefined
    });
    if(!res.ok){ const t = await res.text(); throw new Error(`Shopify ${method} ${path} ${res.status} ${t}`); }
    return res.json();
  }
}

export async function getAdminForShop(shop){
  const stored = getOfflineToken(shop);
  const token = stored || process.env.SHOPIFY_ADMIN_TOKEN;
  if(!token) throw new Error("No admin token available (install the app or set SHOPIFY_ADMIN_TOKEN)");
  return new ShopifyAdmin({ shop, accessToken token });
}
