import crypto from "crypto";
import type { User } from "@strava-musician-app/shared";
import type { UserDAO } from "../daos/userDao";

type UserRecord = User & { passwordHashPerm: string };

const usersById = new Map<string, UserRecord>();
const usersByEmail = new Map<string, UserRecord>();
const usersByUsername = new Map<string, UserRecord>();

export const UserDao: UserDAO = {
  async validateCredentials(email: string, passwordHash: string): Promise<User | null> {
    const rec = usersByEmail.get(email.toLowerCase());
    if (!rec) return null;
    if (rec.passwordHashPerm !== passwordHash) return null;
    const { passwordHashPerm, ...user } = rec;
    return user as User;
  },

  async findUserByEmail(email: string): Promise<User | null> {
    const rec = usersByEmail.get(email.toLowerCase());
    if (!rec) return null;
    const { passwordHashPerm, ...user } = rec;
    return user as User;
  },

  async createUser(input): Promise<User> {
    const id = crypto.randomUUID();
    const email = input.email.toLowerCase();
    const username = input.username;
    const now = new Date();
    const rec: UserRecord = {
      id,
      username,
      email,
      displayName: input.displayName ?? username,
      createdAt: now,
      passwordHashPerm: input.passwordHash,
      imageUrl: input.imageUrl ?? undefined,
      bio: input.bio ?? undefined,
      instruments: input.instruments ?? undefined,
    };
    usersById.set(id, rec);
    usersByEmail.set(email, rec);
    usersByUsername.set(username, rec);
    const { passwordHashPerm, ...user } = rec;
    return user as User;
  },

  async findUserById(id: string): Promise<User | null> {
    const rec = usersById.get(id);
    if (!rec) return null;
    const { passwordHashPerm, ...user } = rec;
    return user as User;
  },

  async findUserByUsername(username: string): Promise<User | null> {
    const rec = usersByUsername.get(username);
    if (!rec) return null;
    const { passwordHashPerm, ...user } = rec;
    return user as User;
  },

  async updateUser(id: string, patch: Partial<User>): Promise<User | null> {
    const rec = usersById.get(id);
    if (!rec) return null;
    const updated = { ...rec, ...patch };
    usersById.set(id, updated);
    if (patch.email) usersByEmail.set(patch.email.toLowerCase(), updated);
    if (patch.username) usersByUsername.set(patch.username, updated);
    const { passwordHashPerm, ...user } = updated;
    return user as User;
  },

  async searchUsers(query: string): Promise<User[]> {
    const q = query.toLowerCase();
    return Array.from(usersById.values())
      .filter(
        u =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.displayName && u.displayName.toLowerCase().includes(q)) ||
          (u.bio && u.bio.toLowerCase().includes(q))
      )
      .map(({ passwordHashPerm, ...user }) => user as User);
  },

  async deleteUser(userId: string): Promise<void> {
    const rec = usersById.get(userId);
    if (!rec) return;
    usersById.delete(userId);
    usersByEmail.delete(rec.email.toLowerCase());
    usersByUsername.delete(rec.username);
  }
};