import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
export async function requireTenant(req:Request,res:Response,next:NextFunction){
  const u=(req as any).user; const orgId=String(req.headers["x-org-id"]||"");
  if(!u) return res.status(401).json({error:"unauthorized"});
  if(!orgId) return res.status(400).json({error:"missing X-Org-Id"});
  const mem=await prisma.membership.findFirst({ where:{ userId:u.sub, orgId } });
  if(!mem) return res.status(403).json({error:"forbidden"});
  (req as any).orgId=orgId; (req as any).role=mem.role; next();
}
