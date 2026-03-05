import { before } from "node:test";
import db from "../config/SupabaseKnexConnection";
import { SupabaseUserDao } from "../SupabaseUserDao";
import { User } from "@strava-musician-app/shared";
import { create } from "domain";

describe("SupabaseUserDao", () => {
  const userDao = new SupabaseUserDao();

  beforeAll(async () => {
    // Clear the User table before running tests
    await db("User").del();
    // create base user
    const user: User = {
      id: "321",
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
    const user: User = {
      id: "123",
      email: "test@example.com",
      createdAt: new Date(),
      username: "testuser",
      imageUrl: "",
      bio: "",
      instruments: [],
      visibility: "private",
    };
    const passwordHash = "hashedpassword";

    const createdUser = await userDao.createUser(user, passwordHash);

    expect(createdUser).toMatchObject({
      id: "123",
      email: "test@example.com",
      username: "testuser",
      imageUrl: "",
      bio: "",
      instruments: [],
      visibility: "private",
    });

    const foundUser = await userDao.findUserByEmail("test@example.com");
    expect(foundUser).toMatchObject({
      id: "123",
      email: "test@example.com",
      username: "testuser",
      imageUrl: "",
      bio: "",
      instruments: [],
      visibility: "private",
    });
  });

  it("should get user by id", async () => {
    const foundUser = await userDao.findUserById("321");
    expect(foundUser).toMatchObject({
      id: "321",
      email: "tester@example.com",
      username: "testyuser",
      imageUrl: "",
      bio: "",
      instruments: [],
      visibility: "private",
    });
  });

  it("should return null for non-existent id", async () => {
    const foundUser = await userDao.findUserById("-1");
    expect(foundUser).toBeNull();
  });

  it("should get user by username", async () => {
    const foundUser = await userDao.findUserByUsername("testyuser");
    expect(foundUser).toMatchObject({
      id: "321",
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
      id: "321",
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
      id: "321",
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
    const updatedUser = await userDao.updateUser("321", {
      bio: "Updated bio",
      instruments: ["guitar", "piano"],
    });
    expect(updatedUser).toMatchObject({
      id: "321",
      email: "tester@example.com",
      username: "testyuser",
      imageUrl: "",
      bio: "Updated bio",
      instruments: ["guitar", "piano"],
      visibility: "private",
    });
  });

  it("should return null when updating non-existent user", async () => {
    const updatedUser = await userDao.updateUser("-1", {
      bio: "Updated bio",
    });
    expect(updatedUser).toBeNull();
  });

  it("should search users", async () => {
    const user2: User = {
      id: "456",
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
      id: "456",
      createdAt: expect.any(Date),
      email: "testyuser2@example.com",
      username: "user2",
      imageUrl: "",
      bio: "User 2 bio",
      instruments: ["drums"],
      visibility: "private",
    });
    expect(searchResults).toContainEqual({
      id: "321",
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
    const deleteResult = await userDao.deleteUser("321");
    expect(deleteResult).toBe(true);

    const foundUser = await userDao.findUserById("321");
    expect(foundUser).toBeNull();
  });

  afterAll(async () => {
    await db.destroy();
  });
});
