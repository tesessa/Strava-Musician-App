import { AuthDao } from "../AuthDao";
import { AuthSession } from "../types/AuthSession";
import { AuthToken } from "@shared/index";

export class SupabaseAuthDao implements AuthDao {
  async createSession(userId: string): Promise<AuthToken> {
    return null as any;
  }

  async getAuthSession(token: string): Promise<AuthSession | null> {
    return null;
  }

  async deleteSession(token: string): Promise<void> {}

  async refreshSession(token: string): Promise<void> {}
}
