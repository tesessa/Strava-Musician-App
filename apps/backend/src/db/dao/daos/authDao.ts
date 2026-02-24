import type { User } from "@strava-musician-app/shared";
import { AuthToken } from "@shared/index";

export interface AuthDAO {
  createTokenForUser(userId: string): Promise<AuthToken>;
  revokeToken(token: string): Promise<boolean>;
  getUserByToken(token: string): Promise<User | null>;
  refreshSession(token: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
}