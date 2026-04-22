import { createHmac, pbkdf2Sync, randomBytes, randomInt, timingSafeEqual } from "crypto";

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET ?? process.env.ADMIN_TOKEN;
  if (!s) throw new Error("Missing JWT_SECRET env var");
  return s;
}

// ─── Password hashing (PBKDF2) ───────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  // Both are hex strings of equal length — safe for timingSafeEqual
  return timingSafeEqual(Buffer.from(attempt, "hex"), Buffer.from(hash, "hex"));
}

// ─── Session token (HMAC-SHA256 signed, base64url payload) ───────────────────

type Payload = { clientId: string; email: string; exp: number };

export function signToken(clientId: string, email: string): string {
  const payload: Payload = {
    clientId,
    email,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getJwtSecret()).update(encoded).digest("hex");
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): Payload | null {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const encoded = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expected = createHmac("sha256", getJwtSecret()).update(encoded).digest("hex");
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
    const payload: Payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: { cookies: { get: (name: string) => { value: string } | undefined } }): Payload | null {
  const token = req.cookies.get("sc_client")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ─── Temp password generator ─────────────────────────────────────────────────

export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[randomInt(0, chars.length)]).join("");
}
