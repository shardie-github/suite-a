import express from "express";
import bodyParser from "body-parser";
const app = express(); app.use(bodyParser.json());
app.post("/stripe/usage", async (req,res)=>{
  // TODO: record usage -> Stripe metered billing (report count, rows processed, etc.)
  res.json({ok:true});
});
app.listen(3010, ()=>console.log("Stripe usage stub on :3010"));
