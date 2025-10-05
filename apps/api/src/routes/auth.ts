import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/crypto.js";
import { sign } from "../lib/jwt.js";
import { z } from "zod";
const router = Router();

router.post("/signup", async (req,res)=>{
  const body=z.object({ email:z.string().email(), password:z.string().min(8), orgName:z.string().min(2) }).parse(req.body);
  const exists = await prisma.user.findUnique({ where:{ email:body.email } });
  if(exists) return res.status(409).json({error:"email_exists"});
  const user = await prisma.user.create({ data:{ email: body.email, passwordHash: await hashPassword(body.password) }});
  const org = await prisma.org.create({ data:{ name: body.orgName }});
  await prisma.membership.create({ data:{ userId:user.id, orgId:org.id, role:"OWNER" }});
  const access = sign({ sub:user.id, email:user.email }, 3600);
  res.json({ access, user:{ id:user.id, email:user.email}, org:{ id:org.id, name:org.name } });
});

router.post("/login", async (req,res)=>{
  const body=z.object({ email:z.string().email(), password:z.string() }).parse(req.body);
  const user = await prisma.user.findUnique({ where:{ email: body.email }});
  if(!user) return res.status(401).json({error:"invalid"});
  const ok = await verifyPassword(body.password, user.passwordHash);
  if(!ok) return res.status(401).json({error:"invalid"});
  const access = sign({ sub:user.id, email:user.email }, 3600);
  res.json({ access, user:{ id:user.id, email:user.email }});
});

router.get("/me", async (req,res)=>{
  const a=req.headers.authorization||""; const t=a.startsWith("Bearer ")?a.slice(7):null;
  if(!t) return res.status(401).json({error:"unauthorized"});
  try{ const u=sign({ok:true},1); }catch{}
  res.json({ ok:true });
});

export default router; export { router };
