import db from "../config/SupabaseKnexConnection";
import { SupabaseUserDao } from "../SupabaseUserDao";
import { User } from "@strava-musician-app/shared";
import { randomUUID } from "crypto";
import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  it,
} from "@jest/globals";

describe("SupabaseUserDao", () => {
  const userDao = new SupabaseUserDao();
  let testUserId1 = "";
  beforeAll(async () => {
    // Clear the User table before running tests
    await db("User").del();
    // create base user
    const user: Omit<User, "userId" | "createdAt" | "updatedAt"> = {
      email: "tester@example.com",
      username: "testyuser",
      profilePhoto: "",
      bio: "",
      postVisibility: "private",
      instruments: [],
    };
    const passwordHash = "hashedpassword";

    const currUser = await userDao.createUser(user, passwordHash);
    testUserId1 = currUser.userId;
  });

  it("should create a user an check it's there", async () => {
    let testUserId2 = "";
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
    testUserId2 = createdUser.userId;

    expect(createdUser).toMatchObject({
      userId: testUserId2,
      email: "test@example.com",
      username: "testuser",
      profilePhoto: undefined,
      bio: undefined,
      postVisibility: "private",
      instruments: [],
    });
    expect(createdUser.userId).toBeDefined();
    expect(createdUser.createdAt).toBeDefined();
    expect(createdUser.updatedAt).toBeDefined();

    const foundUser = await userDao.findUserByEmail("test@example.com");
    expect(foundUser).toMatchObject({
      userId: testUserId2,
      email: "test@example.com",
      username: "testuser",
      profilePhoto: undefined,
      bio: undefined,
      postVisibility: "private",
      instruments: [],
    });
  });

  it("should get user by id", async () => {
    const foundUser = await userDao.findUserById(testUserId1);
    expect(foundUser).toMatchObject({
      userId: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      profilePhoto: undefined,
      bio: undefined,
      postVisibility: "private",
      instruments: [],
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
      userId: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      profilePhoto: undefined,
      bio: undefined,
      postVisibility: "private",
      instruments: [],
    });
  });

  it("should return null for non-existent username", async () => {
    const foundUser = await userDao.findUserByUsername("nonexistent");
    expect(foundUser).toBeNull();
  });

  it("should get by email", async () => {
    const foundUser = await userDao.findUserByEmail("tester@example.com");
    expect(foundUser).toMatchObject({
      userId: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      profilePhoto: undefined,
      bio: undefined,
      postVisibility: "private",
      instruments: [],
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
      userId: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      profilePhoto: undefined,
      bio: undefined,
      instruments: [],
      postVisibility: "private",
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
      userId: testUserId1,
      email: "tester@example.com",
      username: "testyuser",
      profilePhoto: undefined,
      bio: "Updated bio",
      instruments: ["guitar", "piano"],
      postVisibility: "private",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
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
    let testUserId2 = "";
    const user2: Omit<User, "userId" | "createdAt" | "updatedAt"> = {
      email: "testyuser2@example.com",
      username: "user2",
      profilePhoto: "",
      bio: "User 2 bio",
      instruments: ["drums"],
      postVisibility: "private",
    };
    const currUser = await userDao.createUser(user2, "hashedpassword");
    testUserId2 = currUser.userId;

    const searchResults = await userDao.searchUsers("testy");
    expect(searchResults).toContainEqual({
      userId: testUserId2,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      email: "testyuser2@example.com",
      username: "user2",
      profilePhoto: undefined,
      bio: "User 2 bio",
      instruments: ["drums"],
      postVisibility: "private",
    });
    expect(searchResults).toContainEqual({
      userId: testUserId1,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      email: "tester@example.com",
      username: "testyuser",
      profilePhoto: undefined,
      instruments: expect.any(Array),
      postVisibility: "private",
      bio: expect.anything(),
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
