import * as crypto from "crypto";

export function encryptAPIKey(apiKey: string): string {
  const secret = process.env.AI_ENCRYPTION_SECRET || "default-secret-change-in-production";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secret.padEnd(32, "0").slice(0, 32)), iv);
  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptAPIKey(encryptedKey: string): string {
  if (!encryptedKey) return "";
  try {
    const secret = process.env.AI_ENCRYPTION_SECRET || "default-secret-change-in-production";
    const parts = encryptedKey.split(":");
    if (parts.length !== 2) return encryptedKey;
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secret.padEnd(32, "0").slice(0, 32)), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    console.error("Decryption failed", e);
    return encryptedKey;
  }
}