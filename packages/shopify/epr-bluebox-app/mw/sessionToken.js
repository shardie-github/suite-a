/* sessionToken.js — © Hardonia. MIT. */
import jwt from "jsonwebtoken";

/**
 * Lightweight verifier for Shopify App Bridge session tokens.
 * In prod, validate 'iss', 'dest', 'aud' and exp/nbf; here we
 * require a Bearer token and basic JWT shape.
 */
export function requireSessionToken(req,res,next){
  try{
    const auth = req.headers.authorization || "";
    const [,token] = auth.split(" ");
    if(!token) return res.status(401).json({error"Missing session token"});
    const decoded = jwt.decode(token, { complete true });
    if(!decoded) return res.status(401).json({error"Invalid token"});
    //  verify signature against Shopify JWKS or exchange for Admin token if calling Admin API
    req.sessionToken = decoded;
    return next();
  }catch(e){
    return res.status(401).json({error"Invalid/expired session token"});
  }
}
