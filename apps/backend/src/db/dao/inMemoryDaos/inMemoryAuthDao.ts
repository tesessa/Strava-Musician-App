import crypto from "crypto";
import type { User } from "@strava-musician-app/shared";
import type { AuthDAO } from "../daos/authDao";
import { UserDao } from "./inMemoryUserDao";
import { AuthToken } from "@shared/index";

type TokenRecord = { userId: string; expiresAt: number };

const tokens = new Map<string, TokenRecord>();
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export const AuthDao: AuthDAO = {
  async createTokenForUser(userId: string): Promise<AuthToken> {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    tokens.set(token, { userId, expiresAt });
    return { token, timestamp: new Date(expiresAt) };
  },

  async revokeToken(token: string): Promise<boolean> {
    if (!tokens.has(token)) return false;
    tokens.delete(token);
    return true;
  },

  async getUserByToken(token: string): Promise<User | null> {
    const rec = tokens.get(token);
    if (!rec) return null;
    if (Date.now() > rec.expiresAt) {
      tokens.delete(token);
      return null;
    }
    return UserDao.findUserById(rec.userId);
  },

    async refreshSession(token: string): Promise<void> {
    const rec = tokens.get(token);
    if (!rec) return;
    const newExpiresAt = Date.now() + TOKEN_TTL_MS;
    tokens.set(token, { userId: rec.userId, expiresAt: newExpiresAt });
  },
};