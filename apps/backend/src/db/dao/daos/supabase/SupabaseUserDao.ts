import { UserDAO } from "../userDao";
import { User } from "@strava-musician-app/shared";
import db from "./config/SupabaseKnexConnection";
import { User as SupabaseUser } from "./config/SupabaseTableTypes";

function mapSupabaseUserToUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id.toString(),
    email: supabaseUser.email,
    displayName: supabaseUser.username,
    createdAt: supabaseUser.created_at,
    username: supabaseUser.username,
    imageUrl: supabaseUser.image_url,
    bio: supabaseUser.bio,
    // postVisibility: supabaseUser.post_visibility,
    instruments: supabaseUser.instruments,
  };
}

export class SupabaseUserDao implements UserDAO {
  async createUser(user: User, passwordHash: string) {
    const [createdUser] = await db<SupabaseUser>("User")
      .insert({
        id: parseInt(user.id, 10),
        email: user.email,
        username: user.username,
        password: passwordHash,
        image_url: user.imageUrl || "",
        bio: user.bio || "",
        post_visibility: "private",
        instruments: user.instruments || [],
      })
      .returning("*");

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
    const userIdNum = parseInt(userId, 10);
    const user = await db<SupabaseUser>("User")
      .where({ id: userIdNum })
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
    const userIdNum = parseInt(id, 10);
    const updateData: Partial<SupabaseUser> = {};
    if (patch.email) updateData.email = patch.email;
    if (patch.username) updateData.username = patch.username;
    if (patch.displayName) updateData.username = patch.displayName;
    if (patch.imageUrl) {
      updateData.image_url = patch.imageUrl;
    }
    if (patch.bio) updateData.bio = patch.bio;
    if (patch.instruments) updateData.instruments = patch.instruments;

    const [updatedUser] = await db<SupabaseUser>("User")
      .where({ id: userIdNum })
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
        .where({ id: parseInt(userId, 10) })
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
