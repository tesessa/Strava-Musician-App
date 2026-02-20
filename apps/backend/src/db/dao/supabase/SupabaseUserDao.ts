import { UserDao } from "../UserDao";
import { User } from "@shared/index";

export class SupabaseUserDao implements UserDao {
  async getUserById(userId: string) {
    return null;
  }
  async getUserByEmail(email: string) {
    return null;
  }
  async getUserByUsername(username: string) {
    return null;
  }
  async createUser(user: User) {
    return user;
  }
  async updateUser(user: User) {}
  async deleteUser(userId: string) {}
}
