import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET || "dev_secret_change_me";
export const sign = (payload:object, expSec=3600) => jwt.sign(payload, secret, { expiresIn: expSec });
export const verify = (token:string) => jwt.verify(token, secret) as any;
