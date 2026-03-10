import type { User } from "@strava-musician-app/shared";
import type { AuthToken } from "@strava-musician-app/shared";

export interface AuthDAO {
  createTokenForUser(userId: string): Promise<AuthToken>;
  revokeToken(token: string): Promise<boolean>;
  getUserByToken(token: string): Promise<User | null>;
  refreshSession(token: string): Promise<void>;
}