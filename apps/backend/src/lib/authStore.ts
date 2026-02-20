import crypto from "crypto";
import type { User } from "@strava-musician-app/shared";

type UserRecord = User & { passwordHash: string };
type TokenRecord = { userId: string; expiresAt: number };

const usersById = new Map<string, UserRecord>();
const usersByEmail = new Map<string, UserRecord>();
const tokens = new Map<string, TokenRecord>();

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * NOTE: In-memory store only. No demo users are seeded here.
 * The DB-backed implementation should implement the same function signatures.
 */

export async function validateCredentials(email: string, password: string): Promise<User | null> {
  const rec = usersByEmail.get(email.toLowerCase());
  if (!rec) return null;
  if (rec.passwordHash !== hashPassword(password)) return null;
  // return a copy without passwordHash
  const { passwordHash, ...user } = rec;
  return user as User;
}

export async function createTokenForUser(userId: string): Promise<{ token: string; expiresAt: number }> {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  tokens.set(token, { userId, expiresAt });
  return { token, expiresAt };
}

export async function revokeToken(token: string): Promise<boolean> {
  if (!tokens.has(token)) return false;
  tokens.delete(token);
  return true;
}

export async function getUserByToken(token: string): Promise<User | null> {
  const rec = tokens.get(token);
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) {
    tokens.delete(token);
    return null;
  }
  const userRec = usersById.get(rec.userId);
  if (!userRec) return null;
  const { passwordHash, ...user } = userRec;
  return user as User;
}

/**
 * Helper to create a user in the in-memory store.
 * The real DB implementation should expose a createUser function instead.
 * email will be normalized to lowercase.
 */
export async function createUser(input: {
  id?: string;
  username: string;
  email: string;
  displayName?: string;
  password: string;
  imageUrl?: string;
  bio?: string;
  instruments?: string[];
}): Promise<User> {
  const id = input.id ?? crypto.randomUUID();
  const email = input.email.toLowerCase();
  const now = new Date();
  const rec: UserRecord = {
    id,
    username: input.username,
    email,
    displayName: input.displayName ?? input.username,
    createdAt: now,
    passwordHash: hashPassword(input.password),
    imageUrl: input.imageUrl ?? undefined,
    bio: input.bio ?? undefined,
    instruments: input.instruments ?? undefined,
  } as unknown as UserRecord;
  usersById.set(id, rec);
  usersByEmail.set(email, rec);
  const { passwordHash, ...user } = rec;
  return user as User;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const rec = usersByEmail.get(email.toLowerCase());
  if (!rec) return null;
  const { passwordHash, ...user } = rec;
  return user as User;
}


// export function dumpState() {
//   const users = Array.from(usersById.values()).map((rec) => {
//     const { passwordHash, ...user } = rec;
//     return {
//       ...user,
//       // normalize Date -> ISO for safe logging/JSON
//       createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
//     };
//   });

//   const tokensArr = Array.from(tokens.entries()).map(([token, rec]) => ({
//     token,
//     userId: rec.userId,
//     expiresAt: new Date(rec.expiresAt).toISOString(),
//   }));

//   return { users, tokens: tokensArr };
// }
