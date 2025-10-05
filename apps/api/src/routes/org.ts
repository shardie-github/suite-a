import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireTenant } from "../middlewares/tenant.js";
const router = Router();

router.get("/profile", requireAuth, requireTenant, async (req,res)=>{
  const orgId=(req as any).orgId as string;
  const org = await prisma.org.findUnique({ where:{ id: orgId }});
  if(!org) return res.status(404).json({error:"not_found"});
  res.json({ org });
});

router.get("/members", requireAuth, requireTenant, async (req,res)=>{
  const orgId=(req as any).orgId as string;
  const members = await prisma.membership.findMany({ where:{ orgId }, include:{ user:true }});
  res.json({ members: members.map(m=>({ id:m.id, userId:m.userId, role:m.role, email:(m as any).user.email })) });
});

export default router; export { router };
