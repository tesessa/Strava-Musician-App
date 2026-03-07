import { before } from "node:test";
import db from "../config/SupabaseKnexConnection";
import { SupabaseUserDao } from "../SupabaseUserDao";
import { User } from "@strava-musician-app/shared";

describe("SupabaseUserDao", () => {
  const userDao = new SupabaseUserDao();

  beforeAll(async () => {
    // Clear the User table before running tests
    await db("User").del();
  });

  it("should create a user and check it's there", async () => {
    const user: Omit<User, "userId" | "createdAt" | "updatedAt"> = {
      email: "test@example.com",
      username: "testuser",
      profilePhoto: "",
      bio: "",
      postVisibility: "private",
      instruments: [],
    };
    const passwordHash = "hashedpassword";

    const createdUser = await userDao.createUser(user, passwordHash);

    expect(createdUser).toMatchObject({
      email: "test@example.com",
      username: "testuser",
      profilePhoto: "",
      bio: "",
      postVisibility: "private",
      instruments: [],
    });
    expect(createdUser.userId).toBeDefined();
    expect(createdUser.createdAt).toBeDefined();
    expect(createdUser.updatedAt).toBeDefined();

    const foundUser = await userDao.findUserByEmail("test@example.com");
    expect(foundUser).toMatchObject({
      email: "test@example.com",
      username: "testuser",
      profilePhoto: "",
      bio: "",
      postVisibility: "private",
      instruments: [],
    });
  });

  afterAll(async () => {
    await db.destroy();
  });
});
