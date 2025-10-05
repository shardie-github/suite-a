import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";
export function requestId(req:Request,_res:Response,next:NextFunction){ (req as any).rid=req.headers["x-request-id"]||randomUUID(); next(); }
