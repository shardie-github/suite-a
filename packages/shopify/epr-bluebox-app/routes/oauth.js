import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import { setOfflineToken } from "../store/offlineStore.js";
export const oauth = express.Router();

// Start OAuth installation
oauth.get("/install", async (req,res)=>{
  const shop = (req.query.shop||"").toString();
  if(!shop) return res.status(400).send("Missing shop");
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${process.env.APP_URL || "http://localhost:3000"}/oauth/callback`;
  const scopes = (process.env.SHOPIFY_SCOPES || "read_products").split(",").join(",");
  const url = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}`+
              `&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  // In production store state in session; here we just pass it back for demo
  res.redirect(url);
});

// OAuth callback → exchange code for access token (offline)
oauth.get("/callback", async (req,res)=>{
  const { shop, code } = req.query;
  if(!shop || !code) return res.status(400).send("Missing parameters");
  try{
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method:"POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ client_id: process.env.SHOPIFY_API_KEY, client_secret: process.env.SHOPIFY_API_SECRET, code })
    });
    if(!tokenRes.ok){ return res.status(500).send(await tokenRes.text()); }
    const json = await tokenRes.json();
    // Store as "offline" token; for online sessions, you'd request/grab a separate token per user.
    setOfflineToken(String(shop), json.access_token);
    res.send("✅ App installed; offline token stored.");
  }catch(e){
    res.status(500).send("OAuth error: " + e.message);
  }
});

export default oauth;
