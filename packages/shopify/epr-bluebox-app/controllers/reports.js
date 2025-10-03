/* reports.js — © Hardonia. MIT. */
export async function getReport(req,res){
  // demo data; replace with your datalake query
  const rows = [
    { sku"BX-100", qty12, weightKg3.2, fee 8.64 },
    { sku"BX-200", qty7, weightKg2.1, fee 5.04 }
  ];
  res.json({ rows });
}
