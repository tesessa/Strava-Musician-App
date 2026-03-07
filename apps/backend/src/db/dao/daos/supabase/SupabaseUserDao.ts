import { randomUUID } from "crypto";
import { UserDAO } from "../userDao";
import { User } from "@strava-musician-app/shared";
import db from "./config/SupabaseKnexConnection";
import { User as SupabaseUser } from "./config/SupabaseTableTypes";

function mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
  return {
    userId: supabaseUser.id,
    email: supabaseUser.email,
    username: supabaseUser.username,
    profilePhoto: supabaseUser.image_url || undefined,
    bio: supabaseUser.bio || undefined,
    postVisibility: supabaseUser.post_visibility,
    instruments: supabaseUser.instruments ?? [],
  };
}

export class SupabaseUserDao implements UserDAO {
  async createUser(user: Omit<User, "userId">, passwordHash: string) {
    const id = randomUUID();
    const [createdUser] = await db<SupabaseUser>("User")
      .insert({
        id, // User.id and AuthSession.user_id are UUID (string) per architecture
        email: user.email,
        username: user.username,
        password: passwordHash,
        image_url: user.profilePhoto ?? "",
        bio: user.bio ?? "",
        post_visibility: user.postVisibility,
        instruments: user.instruments ?? [],
      })
      .returning("*");

    if (!createdUser) throw new Error("User insert failed");
    return mapSupabaseUserToUser(createdUser);
  }

  async validateCredentials(
    email: string,
    passwordHash: string,
  ): Promise<User | null> {
    const user = await db<SupabaseUser>("User").where({ email: email }).first();
    if (!user) {
      return null;
    }
    if (user.password !== passwordHash) {
      return null;
    }
    return mapSupabaseUserToUser(user);
  }

  async findUserByEmail(email: string) {
    const user = await db<SupabaseUser>("User").where({ email: email }).first();
    if (!user) {
      return null;
    }
    return mapSupabaseUserToUser(user);
  }

  async findUserById(userId: string) {
    const user = await db<SupabaseUser>("User")
      .where({ id: userId })
      .first();
    if (!user) {
      return null;
    }
    return mapSupabaseUserToUser(user);
  }

  async findUserByUsername(username: string) {
    const user = await db<SupabaseUser>("User")
      .where({ username: username })
      .first();
    if (!user) {
      return null;
    }
    return mapSupabaseUserToUser(user);
  }

  async updateUser(id: string, patch: Partial<User>): Promise<User | null> {
    const updateData: Partial<SupabaseUser> = {};
    if (patch.email) updateData.email = patch.email;
    if (patch.username) updateData.username = patch.username;
    if (patch.profilePhoto !== undefined) updateData.image_url = patch.profilePhoto;
    if (patch.bio !== undefined) updateData.bio = patch.bio;
    if (patch.postVisibility !== undefined) updateData.post_visibility = patch.postVisibility;
    if (patch.instruments) updateData.instruments = patch.instruments;

    const [updatedUser] = await db<SupabaseUser>("User")
      .where({ id })
      .update(updateData)
      .returning("*");

    if (!updatedUser) {
      return null;
    }
    return mapSupabaseUserToUser(updatedUser);
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await db<SupabaseUser>("User")
        .where({ id: userId })
        .del();
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
    return true;
  }

  async searchUsers(query: string): Promise<User[]> {
    const users = await db<SupabaseUser>("User")
      .whereILike("username", `%${query}%`)
      .orWhereILike("email", `%${query}%`);

    return users.map(mapSupabaseUserToUser);
  }
}
