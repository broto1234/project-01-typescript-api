// integration tests

import request from "supertest";
import app from "../src/app";
import prisma from "../src/lib/prisma";

import { generateRefreshToken, hashRefreshToken } from "../src/utils/refreshToken";

// Test users are removed/Clean up after every test - Runs after every test and cleans the test data:
afterEach(async () => {
  await prisma.user.deleteMany({     // deleteMany - It doesn't throw an error if the user doesn't exist.
    where: {
      email: {
        in: [
          "testuser@example.com",
          "existing@example.com",
          "login-test@example.com",
          "wrong-password@example.com",
          "auth-me@example.com",
          "refresh-test@example.com",
          "revoked-token@example.com",
          "expired-token@example.com",
        ],
      },
    },
  });
});


// -------- For Authentication ----------
describe("GET /api/auth/me", () => {

  // 1. Test for unauthorized access without authentication - no token provided
  it("should return 401 without authentication", async () => {
    const response = await request(app)
      .get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  // 2. Test for authorized access with - valid token
  it("should return the current user with a valid access token", async () => {
    const user = {
      name: "Auth Me Test User",
      email: "auth-me@example.com",
      password: "Password123",
    };

    // Register user
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.accessToken;

    // Get current user
    const meResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    // Check the response
    expect(meResponse.status).toBe(200);

    expect(meResponse.body).toHaveProperty("user");
    expect(meResponse.body.user.email).toBe(user.email);
    expect(meResponse.body.user.name).toBe(user.name);

    // Password should never be returned
    expect(meResponse.body.user).not.toHaveProperty("password");
  });

  // 3. Test for - invalid - access token
  it("should return 401 with an invalid access token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-access-token");

    expect(response.status).toBe(401);
  });
});


// --------- For Registration ---------
describe("POST /api/auth/register", () => {

  // 4. Test for - invalid (input) - registration data  
  it("should return 400 for invalid registration data", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "",
        email: "not-an-email",
        password: "123",
      });

    expect(response.status).toBe(400);
  });

  // 5. Test for - successful - registration
  it("should register a new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "testuser@example.com",
        password: "Password123",
      });

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("user");

    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.email).toBe("testuser@example.com");

    expect(response.body.user).not.toHaveProperty("password");
  });

  // 6. Test for - duplicate email - registration
  it("should return 409 if email already exists", async () => {
    const user = {
      name: "Existing User",
      email: "existing@example.com",
      password: "Password123",
    };

    // First registration
    const firstResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(firstResponse.status).toBe(201);

    // Second registration with same email
    const secondResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(secondResponse.status).toBe(409);
  });

});



// --------- For Login ---------
describe("POST /api/auth/login", () => {

  // 7. Test for - successful - login with valid credentials
  it("should login successfully with valid credentials", async () => {
    const user = {
      name: "Login Test User",
      email: "login-test@example.com",
      password: "Password123",
    };

    // Create the user first
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);

    expect(loginResponse.body).toHaveProperty("message");
    expect(loginResponse.body).toHaveProperty("accessToken");
  });


  // 8. Test for - incorrect - password
  it("should return 401 for incorrect password", async () => {
    const user = {
      name: "Wrong Password User",
      email: "wrong-password@example.com",
      password: "Password123",
    };

    // Register the user first
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    // Try to login with wrong password
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: "WrongPassword123",
      });

    expect(loginResponse.status).toBe(401);
  });

  // 9. Test for - non-existent/not fiund - user
  it("should return 401 if user does not exist", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "Password123",
      });

    expect(loginResponse.status).toBe(401);
  });
});


// --------- Refresh Token integration tests ---------
describe("POST /api/auth/refresh", () => {

  // 10. Test for successful refresh token rotation
  it("should refresh access token successfully", async () => {
    const user = {
      name: "Refresh Test User",
      email: "refresh-test@example.com",
      password: "Password123",
    };

    // Register user
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);

    const oldRefreshToken =
      loginResponse.body.refreshToken;

    expect(oldRefreshToken).toBeDefined();

    // Refresh tokens
    const refreshResponse = await request(app)
      .post("/api/auth/refresh")
      .send({
        refreshToken: oldRefreshToken,
      });

    expect(refreshResponse.status).toBe(200);

    expect(refreshResponse.body).toHaveProperty(
      "accessToken"
    );

    expect(refreshResponse.body).toHaveProperty(
      "refreshToken"
    );

    expect(
      refreshResponse.body.refreshToken
    ).toBeDefined();

    // It confirms that refresh-token rotation is working.
    expect(
      refreshResponse.body.refreshToken
    ).not.toBe(oldRefreshToken);
  });

  // 11. Test for revoked refresh token - refresh-token rotation prevents reuse of an old refresh token
  it("should reject a refresh token that has already been revoked", async () => {
    const user = {
      name: "Revoked Token Test User",
      email: "revoked-token@example.com",
      password: "Password123",
    };

    // Register user
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);

    const oldRefreshToken =
      loginResponse.body.refreshToken;

    // First refresh
    const firstRefreshResponse = await request(app)
      .post("/api/auth/refresh")
      .send({
        refreshToken: oldRefreshToken,
      });

    expect(firstRefreshResponse.status).toBe(200);

    // Try to reuse the old refresh token
    const secondRefreshResponse = await request(app)
      .post("/api/auth/refresh")
      .send({
        refreshToken: oldRefreshToken,
      });

    expect(secondRefreshResponse.status).toBe(401);
  });


  // 12. Test for invalid refresh token
  it("should return 401 for an invalid refresh token", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .send({
        refreshToken: "invalid-refresh-token",
      });

    expect(response.status).toBe(401);
  });

  
  // 13. Test for expired refresh token
  it("should return 401 for an expired refresh token", async () => {
    const user = {
      name: "Expired Token Test User",
      email: "expired-token@example.com",
      password: "Password123",
    };

    // Register user
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    // Get the created user
    const createdUser =
      await prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });

    expect(createdUser).not.toBeNull();

    // Create a refresh token
    const refreshToken =
      generateRefreshToken();

    // Hash the refresh token
    const tokenHash =
      hashRefreshToken(refreshToken);

    // Store an already expired token
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: createdUser!.id,
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    // Try to use the expired token
    const response = await request(app)
      .post("/api/auth/refresh")
      .send({
        refreshToken,
      });

    expect(response.status).toBe(401);
  });

});


// We are finished testing. Close the database connection - Runs once after the entire test suite and closes Prisma:
afterAll(async () => {
  await prisma.$disconnect();
});