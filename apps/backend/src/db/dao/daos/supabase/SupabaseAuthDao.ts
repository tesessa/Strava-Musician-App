import { AuthDAO } from "../authDao";
import { AuthToken } from "@shared/index";
import type { User } from "@strava-musician-app/shared";

export class SupabaseAuthDao implements AuthDAO {
  createTokenForUser(userId: string): Promise<AuthToken> {
    return null as any;
  }

  async revokeToken(token: string): Promise<boolean> {
    return false;
  }

  getUserByToken(token: string): Promise<User | null> {
    return null as any;
  }

  async refreshToken(token: string): Promise<void> {}
}
