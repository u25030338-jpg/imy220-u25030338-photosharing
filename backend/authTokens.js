const crypto = require("crypto");
const { getDatabase } = require("./db");
const SECRET = process.env.AUTH_TOKEN_SECRET;
function sign(payload) {
  if (!SECRET || SECRET.length < 32) throw new Error("AUTH_TOKEN_SECRET must be at least 32 characters.");
  const body = Buffer.from(JSON.stringify({...payload, exp: Date.now() + 12*60*60*1000})).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verify(token) {
  if (!SECRET || !token) return null;
  const [body, sig] = token.split("."); if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest();
  let actual; try { actual = Buffer.from(sig, "base64url"); } catch { return null; }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try { const payload = JSON.parse(Buffer.from(body, "base64url").toString()); return payload.exp > Date.now() ? payload : null; } catch { return null; }
}
async function requireAdmin(req,res,next) {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const payload = verify(token);
    if (!payload?.id) return res.status(401).json({success:false,message:"Sign in required."});
    const user = await getDatabase().collection("users").findOne({id:Number(payload.id)});
    if (!user || user.role !== "admin") return res.status(403).json({success:false,message:"Administrator access required."});
    req.admin = user; next();
  } catch(e) { console.error("Admin authorization error:",e); res.status(500).json({success:false,message:"Authorization check failed."}); }
}
module.exports = { sign, verify, requireAdmin };
