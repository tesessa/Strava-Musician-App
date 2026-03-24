import type { User } from "@strava-musician-app/shared";
import type { AuthDAO } from "../../db/dao/daos/authDao";
import type { UserDAO } from "../../db/dao/daos/userDao";
import { hashPassword } from "../utils/hashPassword";

export class AuthService {
  constructor(
    private userDao: UserDAO,
    private authDao: AuthDAO,
  ) {}

  async login(email: string, password: string) {
    const hashedPassword = hashPassword(password);
    const user = await this.userDao.validateCredentials(email, hashedPassword);
    if (!user) return { error: "invalid credentials", status: 401 };

    const authToken = await this.authDao.createTokenForUser(user.userId);
    return { token: authToken.token, user, status: 200 };
  }

  async logout(token: string) {
    const ok = await this.authDao.revokeToken(token);
    if (!ok) return { error: "invalid_token", status: 401 };
    return { status: 204 };
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    profilePhoto?: string;
    imageUrl?: string;
    bio?: string;
    instruments?: string[];
    postVisibility?: "friends" | "public" | "private";
  }) {
    if (!data.email || !data.username || !data.password) {
      return { error: "email, username and password required", status: 400 };
    }

    const existingEmail = await this.userDao.findUserByEmail(data.email);
    const existingUsername = await this.userDao.findUserByUsername(data.username);

    if (existingEmail) return { error: "email already in use", status: 400 };
    if (existingUsername) return { error: "username already in use", status: 400 };

    const hashedPassword = hashPassword(data.password);
    const now: string = new Date().toISOString();
    const newUser: User = {
      email: data.email,
      username: data.username,
      profilePhoto: data.profilePhoto ?? data.imageUrl,
      bio: data.bio,
      postVisibility: data.postVisibility ?? "friends",
      instruments: data.instruments ?? [],
      userId: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

      const user = await this.userDao.createUser(newUser, hashedPassword);
      const authToken = await this.authDao.createTokenForUser(user.userId);

      return { token: authToken.token, user, status: 201 };
  }
}
