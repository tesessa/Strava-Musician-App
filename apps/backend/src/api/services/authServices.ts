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
    const AuthToken = await this.authDao.createTokenForUser(user.userId);
    return { AuthToken, user, status: 200 };
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
  }) {
    if (!data.email || !data.username || !data.password) {
      return { error: "email, username and password required", status: 400 };
    }
    const existing = await this.userDao.findUserByEmail(data.email);
    if (existing) return { error: "email_already_exists", status: 409 };
    const hashedPassword = hashPassword(data.password);
    const newUser: Omit<User, "userId" | "createdAt" | "updatedAt"> = {
      email: data.email,
      username: data.username,
      profilePhoto: data.profilePhoto ?? data.imageUrl,
      bio: data.bio,
      postVisibility: "friends",
      instruments: data.instruments ?? [],
    };
    const user = await this.userDao.createUser(newUser, hashedPassword);
    const AuthToken = await this.authDao.createTokenForUser(user.userId);
    return { AuthToken, user, status: 201 };
  }

  async me(token: string) {
    const user = await this.authDao.getUserByToken(token);
    if (!user) return { error: "invalid_token", status: 401 };
    return { user, status: 200 };
  }
}
