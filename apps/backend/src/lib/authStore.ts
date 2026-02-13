import crypto from "crypto";

export type DevUser = {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
};

type TokenRecord = {
  userId: string;
  expiresAt: number;
};

const usersById = new Map<string, DevUser>();
const usersByEmail = new Map<string, DevUser>();
const tokens = new Map<string, TokenRecord>();

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours (demo)

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function seedDevUser(email = "demo@local", password = "password", name = "Demo User") {
  if (usersByEmail.has(email)) return usersByEmail.get(email)!;
  const id = crypto.randomUUID();
  const user: DevUser = {
    id,
    email,
    name,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  usersById.set(id, user);
  usersByEmail.set(email, user);
  return user;
}

export function validateCredentials(email: string, password: string) {
  const u = usersByEmail.get(email);
  if (!u) return null;
  if (u.passwordHash !== hashPassword(password)) return null;
  return u;
}

export function createTokenForUser(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  tokens.set(token, { userId, expiresAt });
  return { token, expiresAt };
}

export function getUserByToken(token: string) {
  const rec = tokens.get(token);
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) {
    tokens.delete(token);
    return null;
  }
  return usersById.get(rec.userId) ?? null;
}

// seed a demo account for convenience
seedDevUser();