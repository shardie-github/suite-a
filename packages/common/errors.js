/* errors.js — © Hardonia. MIT. */
export function notFound(_req,res){ res.status(404).json({error:"Not Found"}); }
export function onError(err,_req,res,_next){
  const code = err.status || 500;
  res.status(code).json({error: err.message || "Internal error"});
}
