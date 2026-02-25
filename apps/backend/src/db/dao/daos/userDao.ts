import type { User } from "@strava-musician-app/shared";

export interface UserDAO {
  createUser(user: User, passwordHash: string): Promise<User>;
  validateCredentials(email: string, passwordHash: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  updateUser(id: string, patch: Partial<User>): Promise<User | null>;
  deleteUser(userId: string): Promise<boolean>;
  searchUsers(query: string): Promise<User[]>;
}