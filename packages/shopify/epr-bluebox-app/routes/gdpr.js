/* gdpr.js — © Hardonia. MIT. */
import express from "express";
import { verifyShopifyHmac } from "../mw/shopifyHmac.js";
export const gdpr = express.Router();
gdpr.post("/customers/data_request", verifyShopifyHmac, (req,res)=>{ res.sendStatus(200); });
gdpr.post("/customers/redact", verifyShopifyHmac, async (req,res)=>{ res.sendStatus(200); });
gdpr.post("/shop/redact", verifyShopifyHmac, async (req,res)=>{ res.sendStatus(200); });
export default gdpr;
