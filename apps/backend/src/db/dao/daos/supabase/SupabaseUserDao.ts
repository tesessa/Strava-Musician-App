import { UserDAO } from "../userDao";
import { User } from "@shared/index";

export class SupabaseUserDao implements UserDAO {
  async createUser(user: User, passwordHash: string) {
    return user;
  }

  async validateCredentials(
    email: string,
    passwordHash: string,
  ): Promise<User | null> {
    return null;
  }

  async findUserByEmail(email: string) {
    return null;
  }

  async findUserById(userId: string) {
    return null;
  }

  async findUserByUsername(username: string) {
    return null;
  }

  async updateUser(id: string, patch: Partial<User>): Promise<User | null> {
    return null as any;
  }

  async deleteUser(userId: string) {}

  async searchUsers(query: string): Promise<User[]> {
    return Promise.resolve([]);
  }
}
