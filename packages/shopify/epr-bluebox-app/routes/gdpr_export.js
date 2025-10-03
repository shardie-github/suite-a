/* gdpr_export.js — © Hardonia. MIT. */
import express from "express";
export const gdprExport = express.Router();
gdprExport.get("/export", async (req,res)=>{
  // Demo payload. Replace with real customer/shop data pulls.
  res.json({
    shop: process.env.SHOPIFY_SHOP_DOMAIN || "dev-shop.myshopify.com",
    generatedAt: new Date().toISOString(),
    data: [{ type:"order", id:"1001", items:2, total: 49.90 }]
  });
});
export default gdprExport;
