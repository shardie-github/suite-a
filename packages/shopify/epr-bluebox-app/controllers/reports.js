/* reports.js — © Hardonia. MIT. */
export async function getReport(req,res){
  // demo data; replace with your datalake query
  const rows = [
    { sku:"BX-100", qty:12, weightKg:3.2, fee: 8.64 },
    { sku:"BX-200", qty:7, weightKg:2.1, fee: 5.04 }
  ];
  res.json({ rows });
}
