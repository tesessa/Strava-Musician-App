import { randomUUID } from "crypto";
import { AuthDAO } from "../authDao";
import { AuthToken } from "@strava-musician-app/shared";
import type { User } from "@strava-musician-app/shared";
import db from "./config/SupabaseKnexConnection";
import { User as SupabaseUser, AuthSession } from "./config/SupabaseTableTypes";

function mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
  return {
    userId: supabaseUser.id,
    email: supabaseUser.email,
    username: supabaseUser.username,
    profilePhoto: supabaseUser.image_url || undefined,
    bio: supabaseUser.bio || undefined,
    postVisibility: supabaseUser.post_visibility,
    instruments: supabaseUser.instruments ?? [],
    createdAt:
      supabaseUser.created_at instanceof Date
        ? supabaseUser.created_at.toISOString()
        : new Date(supabaseUser.created_at).toISOString(),
    updatedAt:
      supabaseUser.updated_at instanceof Date
        ? supabaseUser.updated_at.toISOString()
        : new Date(supabaseUser.updated_at).toISOString(),
  };
}

export class SupabaseAuthDao implements AuthDAO {
  TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

  async createTokenForUser(userId: string): Promise<AuthToken> {
    const token = randomUUID();
    const expiresAt = Date.now() + this.TOKEN_TTL_MS;
    await db<AuthSession>("AuthSession").insert({
      user_id: userId,
      token,
      expires_at: new Date(expiresAt),
    });
    return { token, timestamp: new Date(expiresAt) };
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      await db<AuthSession>("AuthSession").where({ token: token }).del();
    } catch (err) {
      console.error("Error revoking token:", err);
      return false;
    }
    return true;
  }

  async getUserByToken(token: string): Promise<User | null> {
    const isValid = await this.checkTokenValidity(token);
    if (!isValid) {
      return null;
    }
    const user = await db("AuthSession")
      .join("User", "AuthSession.user_id", "User.id")
      .where("AuthSession.token", token)
      .select("User.*")
      .first();
    if (!user) {
      return null;
    }
    return mapSupabaseUserToUser(user);
  }

  async refreshSession(token: string): Promise<void> {
    const newExpiresAt = new Date(Date.now() + this.TOKEN_TTL_MS);

    const isValid = await this.checkTokenValidity(token);
    if (!isValid) {
      return;
    }

    await db<AuthSession>("AuthSession")
      .where({ token: token })
      .update({ expires_at: newExpiresAt });
  }

  async checkTokenValidity(token: string): Promise<boolean> {
    const session = await db<AuthSession>("AuthSession")
      .where({ token: token })
      .first();

    if (!session) {
      return false;
    }

    if (new Date() > session.expires_at) {
      await db<AuthSession>("AuthSession").where({ token: token }).del();
      return false;
    }

    return true;
  }

  async getTokenExpiration(token: string): Promise<Date | null> {
    const session = await db<AuthSession>("AuthSession")
      .where({ token: token })
      .first();

    if (!session) {
      return null;
    }

    return session.expires_at;
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db<AuthSession>("AuthSession")
      .where("expires_at", "<", new Date())
      .del();
  }
}
