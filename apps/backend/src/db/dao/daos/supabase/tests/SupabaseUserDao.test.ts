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

  it("should create a user an check it's there", async () => {
    const user: User = {
      id: "123",
      email: "test@example.com",
      displayName: "testuser",
      createdAt: new Date(),
      username: "testuser",
      imageUrl: "",
      bio: "",
      instruments: [],
    };
    const passwordHash = "hashedpassword";

    const createdUser = await userDao.createUser(user, passwordHash);

    expect(createdUser).toMatchObject({
      id: "123",
      email: "test@example.com",
      displayName: "testuser",
      username: "testuser",
      imageUrl: "",
      bio: "",
      instruments: [],
    });

    const foundUser = await userDao.findUserByEmail("test@example.com");
    expect(foundUser).toMatchObject({
      id: "123",
      email: "test@example.com",
      displayName: "testuser",
      username: "testuser",
      imageUrl: "",
      bio: "",
      instruments: [],
    });
  });

  afterAll(async () => {
    await db.destroy();
  });
});
