import { AuthToken } from "@shared/index";
import { AuthSession } from "./types/AuthSession";

export interface AuthDao {
  createSession(userId: string): Promise<AuthToken>;
  getAuthSession(token: string): Promise<AuthSession | null>;
  deleteSession(token: string): Promise<void>;
  refreshSession(token: string): Promise<void>;
}
