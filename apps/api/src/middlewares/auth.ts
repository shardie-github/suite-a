import type { Request, Response, NextFunction } from "express";
import { verify } from "../lib/jwt.js";
export function requireAuth(req:Request,res:Response,next:NextFunction){
  const a=req.headers.authorization||""; const t=a.startsWith("Bearer ")?a.slice(7):"";
  try{ (req as any).user=verify(t); next(); } catch{ res.status(401).json({error:"unauthorized"}); }
}
