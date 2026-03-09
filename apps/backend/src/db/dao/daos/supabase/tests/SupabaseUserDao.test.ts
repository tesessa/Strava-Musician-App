import db from "../config/SupabaseKnexConnection";
import { SupabaseUserDao } from "../SupabaseUserDao";
import { User } from "@strava-musician-app/shared";
import { randomUUID } from "crypto";

describe("SupabaseUserDao", () => {
  const userDao = new SupabaseUserDao();
  const testUserId1 = randomUUID();
  beforeAll(async () => {
    // Clear the User table before running tests
    await db("User").del();
    // create base user
    const user: User = {
      id: testUserId1,
      email: "tester@example.com",
      createdAt: new Date(),
      username: "testyuser",
      imageUrl: "",
      bio: "",
      instruments: [],
      visibility: "private",
    };
    const passwordHash = "hashedpassword";

    await userDao.createUser(user, passwordHash);
  });

  it("should create a user an check it's there", async () => {
    const testUserId2 = randomUUID();
    const user: User = {
      id: testUserId2,
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
      id: testUserId2,
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
      id: testUserId2,
      email: "test@example.com",
      username: "testuser",
      profilePhoto: "",
      bio: "",
      postVisibility: "private",
      instruments: [],
    });
  });

  it("should get user by id", async () => {
    const foundUser = await userDao.findUserById(testUserId1);
    expect(foundUser).toMatchObject({
      id: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      imageUrl: "",
      bio: "",
      instruments: [],
      visibility: "private",
    });
  });

  it("should return null for non-existent id", async () => {
    const notRealID = randomUUID();
    const foundUser = await userDao.findUserById(notRealID);
    expect(foundUser).toBeNull();
  });

  it("should get user by username", async () => {
    const foundUser = await userDao.findUserByUsername("testyuser");
    expect(foundUser).toMatchObject({
      id: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      imageUrl: "",
      bio: "",
      instruments: [],
      visibility: "private",
    });
  });

  it("should return null for non-existent username", async () => {
    const foundUser = await userDao.findUserByUsername("nonexistent");
    expect(foundUser).toBeNull();
  });

  it("should get by email", async () => {
    const foundUser = await userDao.findUserByEmail("tester@example.com");
    expect(foundUser).toMatchObject({
      id: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      imageUrl: "",
      bio: "",
      instruments: [],
      visibility: "private",
    });
  });

  it("should return null for non-existent email", async () => {
    const foundUser = await userDao.findUserByEmail("nonexistent@example.com");
    expect(foundUser).toBeNull();
  });

  it("should validate credentials", async () => {
    const validUser = await userDao.validateCredentials(
      "tester@example.com",
      "hashedpassword",
    );
    expect(validUser).toMatchObject({
      id: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      imageUrl: "",
      bio: "",
      instruments: [],
      visibility: "private",
    });
  });

  it("should not validate wrong credentials", async () => {
    const invalidUser = await userDao.validateCredentials(
      "tester@example.com",
      "wrongpassword",
    );
    expect(invalidUser).toBeNull();
  });

  it("should not validate non-existent user", async () => {
    const invalidUser = await userDao.validateCredentials(
      "nonexistent@example.com",
      "hashedpassword",
    );
    expect(invalidUser).toBeNull();
  });

  it("should update user", async () => {
    const updatedUser = await userDao.updateUser(testUserId1, {
      bio: "Updated bio",
      instruments: ["guitar", "piano"],
    });
    expect(updatedUser).toMatchObject({
      id: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      imageUrl: "",
      bio: "Updated bio",
      instruments: ["guitar", "piano"],
      visibility: "private",
    });
  });

  it("should return null when updating non-existent user", async () => {
    const notRealID = randomUUID();
    const updatedUser = await userDao.updateUser(notRealID, {
      bio: "Updated bio",
    });
    expect(updatedUser).toBeNull();
  });

  it("should search users", async () => {
    const testUserId2 = randomUUID();
    const user2: User = {
      id: testUserId2,
      createdAt: new Date(),
      email: "testyuser2@example.com",
      username: "user2",
      imageUrl: "",
      bio: "User 2 bio",
      instruments: ["drums"],
      visibility: "private",
    };
    await userDao.createUser(user2, "hashedpassword");

    const searchResults = await userDao.searchUsers("testy");
    expect(searchResults).toContainEqual({
      id: testUserId2,
      createdAt: expect.any(Date),
      email: "testyuser2@example.com",
      username: "user2",
      imageUrl: "",
      bio: "User 2 bio",
      instruments: ["drums"],
      visibility: "private",
    });
    expect(searchResults).toContainEqual({
      id: testUserId1,
      createdAt: expect.any(Date),
      email: "tester@example.com",
      username: "testyuser",
      imageUrl: "",
      bio: expect.any(String),
      instruments: expect.any(Array),
      visibility: "private",
    });
  });

  it("should delete user", async () => {
    const deleteResult = await userDao.deleteUser(testUserId1);
    expect(deleteResult).toBe(true);

    const foundUser = await userDao.findUserById(testUserId1);
    expect(foundUser).toBeNull();
  });

  afterAll(async () => {
    await db.destroy();
  });
});
