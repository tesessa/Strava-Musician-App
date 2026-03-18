import crypto from "crypto";

const STATIC_SALT = "strava-demo-salt"; // FIXME Not secure for production! Dao implementations should use a proper password hashing algorithm with a unique salt per user, like bcrypt or Argon2. This is just a placeholder for demonstration purposes.

export function hashPassword(password: string): string {
  // SHA-256 with a static salt
  return crypto.createHash("sha256").update(STATIC_SALT + password).digest("hex");
}
