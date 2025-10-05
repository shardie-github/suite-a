import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireTenant } from "../middlewares/tenant.js";
import { z } from "zod";
const router = Router();

router.get("/", requireAuth, requireTenant, async (req,res)=>{
  const orgId=(req as any).orgId as string;
  const flags = await prisma.featureFlag.findMany({ where:{ orgId }});
  res.json({ flags });
});

router.post("/", requireAuth, requireTenant, async (req,res)=>{
  const orgId=(req as any).orgId as string;
  const body=z.object({ name:z.string().min(1), enabled:z.boolean().default(false) }).parse(req.body);
  const flag = await prisma.featureFlag.upsert({ where:{ orgId_name: { orgId, name: body.name }}, create:{ orgId, name: body.name, enabled: body.enabled }, update:{ enabled: body.enabled }});
  res.json({ flag });
});

export default router; export { router };
