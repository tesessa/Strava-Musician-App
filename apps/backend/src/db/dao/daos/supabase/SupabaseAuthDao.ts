import { randomUUID } from "crypto";
import { AuthDAO } from "../authDao";
import { AuthToken } from "@strava-musician-app/shared";
import type { User } from "@strava-musician-app/shared";
import db from "./config/SupabaseKnexConnection";
import { User as SupabaseUser, AuthSession } from "./config/SupabaseTableTypes";

const TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

function mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id.toString(),
    email: supabaseUser.email,
    displayName: supabaseUser.username,
    createdAt: supabaseUser.created_at,
    username: supabaseUser.username,
    imageUrl: supabaseUser.image_url,
    bio: supabaseUser.bio,
    // postVisibility: supabaseUser.post_visibility,
    instruments: supabaseUser.instruments,
  };
}

export class SupabaseAuthDao implements AuthDAO {
  async createTokenForUser(userId: string): Promise<AuthToken> {
    const token = randomUUID();
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    await db<AuthSession>("AuthSession").insert({
      user_id: parseInt(userId, 10),
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
    const newExpiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await db<AuthSession>("AuthSession")
      .where({ token: token })
      .update({ expires_at: newExpiresAt });
  }

  async checkAndRefreshSession(token: string): Promise<boolean> {
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

    await this.refreshSession(token);
    return true;
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

  async cleanupExpiredSessions(): Promise<void> {
    await db<AuthSession>("AuthSession")
      .where("expires_at", "<", new Date())
      .del();
  }
}
