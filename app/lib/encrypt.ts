import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV for GCM
const TAG_LENGTH = 16;
const ENCODING = "base64";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypts a string value. Returns "iv:tag:ciphertext" encoded in base64.
 * Returns the original value unchanged if it's already encrypted or null/undefined.
 */
export function encrypt(value: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString(ENCODING),
    tag.toString(ENCODING),
    encrypted.toString(ENCODING),
  ].join(":");
}

/**
 * Decrypts a value encrypted by `encrypt()`. Returns the original string.
 * If the value is not in the expected encrypted format, returns it as-is
 * (safe fallback for rows that predate encryption).
 */
export function decrypt(value: string): string {
  if (!value || !value.includes(":")) return value;
  const parts = value.split(":");
  if (parts.length !== 3) return value;
  try {
    const key = getKey();
    const [ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64, ENCODING);
    const tag = Buffer.from(tagB64, ENCODING);
    const data = Buffer.from(dataB64, ENCODING);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(data).toString("utf8") + decipher.final("utf8");
  } catch {
    // Return raw value if decryption fails (e.g., unencrypted legacy row)
    return value;
  }
}

/**
 * Encrypt specified string fields on a record before DB write.
 * Skips null/undefined values.
 */
export function encryptFields<T extends Record<string, unknown>>(
  record: T,
  fields: readonly (keyof T)[]
): T {
  const result = { ...record } as Record<string, unknown>;
  for (const field of fields) {
    const val = result[field as string];
    if (typeof val === "string" && val.length > 0) {
      result[field as string] = encrypt(val);
    }
  }
  return result as T;
}

/**
 * Decrypt specified string fields on a record after DB read.
 * Skips null/undefined values.
 */
export function decryptFields<T extends Record<string, unknown>>(
  record: T,
  fields: readonly (keyof T)[]
): T {
  const result = { ...record } as Record<string, unknown>;
  for (const field of fields) {
    const val = result[field as string];
    if (typeof val === "string" && val.length > 0) {
      result[field as string] = decrypt(val);
    }
  }
  return result as T;
}

/** Decrypt an array of records. */
export function decryptAll<T extends Record<string, unknown>>(
  records: T[],
  fields: readonly (keyof T)[]
): T[] {
  return records.map((r) => decryptFields(r, fields));
}
