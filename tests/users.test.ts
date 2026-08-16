// Tests - authentication, authorization, pagination, filtering, searching, sorting, and validation.

import request from "supertest";
import app from "../src/app";
import prisma from "../src/lib/prisma";


// Helper function
const getAdminAccessToken = async (
  email: string
): Promise<string> => {
  const password = "Password123";

  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Admin",
        email,
        password,
      });

    expect(registerResponse.status).toBe(201);

    user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  expect(user).not.toBeNull();

  await prisma.user.update({
    where: {
      id: user!.id,
    },
    data: {
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password,
    });

  expect(loginResponse.status).toBe(200);

  return loginResponse.body.accessToken;
};


// Cleanup
afterEach(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          // your existing test emails
          "user-by-id-admin@example.com",
          "self-test@example.com",
          "user-a@example.com",
          "user-b@example.com",
          "admin-target@example.com",
          "john-update@example.com",
          "john-updated@example.com",
          "validation-admin@example.com",
          "admin-update@example.com",
          "target-user@example.com",
          "updated-by-admin@example.com",
        ],
      },
    },
  });
});


// --------- Tests ---------
// A. GET /api/users endpoint - authentication, authorization, pagination, filtering, searching, sorting, and validation.
describe("GET /api/users", () => {

  let adminAccessToken: string;

  const adminEmail =
    "users-test-admin@example.com";

  const adminPassword =
    "Password123";


  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Users Test Admin",
        email: adminEmail,
        password: adminPassword,
      });

    const admin =
      await prisma.user.findUnique({
        where: {
          email: adminEmail,
        },
      });

    expect(admin).not.toBeNull();

    await prisma.user.update({
      where: {
        id: admin!.id,
      },
      data: {
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password: adminPassword,
      });

    expect(loginResponse.status).toBe(200);

    adminAccessToken =
      loginResponse.body.accessToken;
  });

  // 1. Test for unauthenticated access - No JWT 401
  it("should return 401 without authentication", async () => {
    const response = await request(app)
      .get("/api/users");

    expect(response.status).toBe(401);
  });

  // 2. Test for a regular user trying to access the endpoint - Valid USER JWT - 403
  it("should return 403 for a regular user", async () => {
    const user = {
      name: "Regular User",
      email: "regular-user@example.com",
      password: "Password123",
    };

    // Register
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    const createdUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    expect(createdUser).not.toBeNull();

    await prisma.user.update({
      where: {
        id: createdUser!.id,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    });

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;

    // Try to access admin endpoint
    const response = await request(app)
      .get("/api/users")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(403);
  });

  // 3. Test for an admin user accessing the endpoint - authorized access - Valid ADMIN JWT - 200
  it("should return 200 for an admin user", async () => {
    const user = {
      name: "Admin User",
      email: "admin-user@example.com",
      password: "Password123",
    };

    // Register user
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    // Find the user
    const createdUser =
      await prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });

    expect(createdUser).not.toBeNull();

    // Change role to ADMIN - update the role before login, because JWT is generated during login
    await prisma.user.update({
      where: {
        id: createdUser!.id,
      },
      data: {
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });

    // Login again to get a token containing ADMIN role
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;

    // Access admin endpoint
    const response = await request(app)
      .get("/api/users")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);
  });


  // 4. Test for pagination and limit
  it("should return paginated users for an admin", async () => {
    const admin = {
      name: "Pagination Admin",
      email: "pagination-admin@example.com",
      password: "Password123",
    };

    // Register admin
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(admin);

    expect(registerResponse.status).toBe(201);

    // Find the user
    const createdAdmin =
      await prisma.user.findUnique({
        where: {
          email: admin.email,
        },
      });

    expect(createdAdmin).not.toBeNull();

    // Change role to ADMIN
    await prisma.user.update({
      where: {
        id: createdAdmin!.id,
      },
      data: {
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });

    // Login as admin
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: admin.email,
        password: admin.password,
      });

    expect(loginResponse.status).toBe(200);

    const createdUser = await prisma.user.findUnique({
  where: {
    email: admin.email,
  },
});

expect(createdUser).not.toBeNull();

await prisma.user.update({
  where: {
    id: createdUser!.id,
  },
  data: {
    role: "ADMIN",
    emailVerifiedAt: new Date(),
  },
});

    const accessToken =
      loginResponse.body.accessToken;

    // Request page 1 with 2 users per page
    const response = await request(app)
      .get("/api/users")
      .query({
        page: 1,
        limit: 2,
      })
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body).toHaveProperty(
      "users"
    );

    expect(response.body).toHaveProperty(
      "pagination"
    );

    expect(
      response.body.pagination
    ).toHaveProperty("page");

    expect(
      response.body.pagination
    ).toHaveProperty("limit");

    expect(
      response.body.pagination.page
    ).toBe(1);

    expect(
      response.body.pagination.limit
    ).toBe(2);

    expect(
      response.body.users.length
    ).toBeLessThanOrEqual(2);
  });


  // 5. Test for filtering users by role - GET /api/users?role=USER
  it("should filter users by role", async () => {
    const admin = {
      name: "Role Filter Admin",
      email: "role-filter-admin@example.com",
      password: "Password123",
    };

    const regularUser = {
      name: "Role Filter User",
      email: "role-filter-user@example.com",
      password: "Password123",
    };

    // Register admin
    await request(app)
      .post("/api/auth/register")
      .send(admin);

    // Register regular user
    await request(app)
      .post("/api/auth/register")
      .send(regularUser);

    // Find admin
    const createdAdmin =
      await prisma.user.findUnique({
        where: {
          email: admin.email,
        },
      });

    expect(createdAdmin).not.toBeNull();

    // Change role to ADMIN
    await prisma.user.update({
      where: {
        id: createdAdmin!.id,
      },
      data: {
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });

    // Login as admin
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: admin.email,
        password: admin.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;

    // Request only USERs
    const response = await request(app)
      .get("/api/users")
      .query({
        role: "USER",
      })
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(
      response.body.users
    ).toBeInstanceOf(Array);

    // Every returned user must have USER role
    for (const user of response.body.users) {
      expect(user.role).toBe("USER");
    }
  });


  // 6. Test for searching users by name or email - GET /api/users?search=John
  it("should search users by name or email", async () => {
    const admin = {
      name: "Search Admin",
      email: "search-admin@example.com",
      password: "Password123",
    };

    const johnUser = {
      name: "John Smith",
      email: "john@example.com",
      password: "Password123",
    };

    const janeUser = {
      name: "Jane Smith",
      email: "jane@example.com",
      password: "Password123",
    };

    // Register admin
    await request(app)
      .post("/api/auth/register")
      .send(admin);

    // Register John
    await request(app)
      .post("/api/auth/register")
      .send(johnUser);

    // Register Jane
    await request(app)
      .post("/api/auth/register")
      .send(janeUser);

    // Find admin
    const createdAdmin =
      await prisma.user.findUnique({
        where: {
          email: admin.email,
        },
      });

    expect(createdAdmin).not.toBeNull();

    // Change role to ADMIN
    await prisma.user.update({
      where: {
        id: createdAdmin!.id,
      },
      data: {
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });

    // Login as admin
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: admin.email,
        password: admin.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;

    // Search for John
    const response = await request(app)
      .get("/api/users")
      .query({
        search: "John",
      })
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(
      response.body.users
    ).toBeInstanceOf(Array);

    // John should be returned
    expect(
      response.body.users.some(
        (user: { email: string }) =>
          user.email === "john@example.com"
      )
    ).toBe(true);

    // Jane should not be returned
    expect(
      response.body.users.some(
        (user: { email: string }) =>
          user.email === "jane@example.com"
      )
    ).toBe(false);
  });


  // 7. Test for sorting users by name in ascending order - GET /api/users?sortBy=name&sortOrder=asc
  it("should sort users by name in ascending order", async () => {
    const admin = {
      name: "Sort Admin",
      email: "sort-admin@example.com",
      password: "Password123",
    };

    const userA = {
      name: "Alice Test",
      email: "alice@example.com",
      password: "Password123",
    };

    const userB = {
      name: "Bob Test",
      email: "bob@example.com",
      password: "Password123",
    };

    // Register users
    await request(app)
      .post("/api/auth/register")
      .send(admin);

    await request(app)
      .post("/api/auth/register")
      .send(userB);

    await request(app)
      .post("/api/auth/register")
      .send(userA);

    // Make admin an ADMIN
    const createdAdmin =
      await prisma.user.findUnique({
        where: {
          email: admin.email,
        },
      });

    expect(createdAdmin).not.toBeNull();

    await prisma.user.update({
      where: {
        id: createdAdmin!.id,
      },
      data: {
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });

    // Login as admin
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: admin.email,
        password: admin.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;

    // Request users sorted by name ASC
    const response = await request(app)
      .get("/api/users")
      .query({
        sortBy: "name",
        sortOrder: "asc",
        limit: 100,
      })
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);

    const users = response.body.users;

    expect(users).toBeInstanceOf(Array);

    // Find our test users
    const alice = users.find(
      (user: { email: string }) =>
        user.email === "alice@example.com"
    );

    const bob = users.find(
      (user: { email: string }) =>
        user.email === "bob@example.com"
    );

    expect(alice).toBeDefined();
    expect(bob).toBeDefined();

    // Alice should come before Bob
    expect(
      users.indexOf(alice)
    ).toBeLessThan(
      users.indexOf(bob)
    );
  });

  // 8. Test for sorting users by name in descending order - GET /api/users?sortBy=name&sortOrder=desc
  it("should sort users by name in descending order", async () => {
    const admin = {
      name: "Sort Desc Admin",
      email: "sort-desc-admin@example.com",
      password: "Password123",
    };

    const userA = {
      name: "Alice Desc Test",
      email: "alice-desc@example.com",
      password: "Password123",
    };

    const userB = {
      name: "Bob Desc Test",
      email: "bob-desc@example.com",
      password: "Password123",
    };

    // Register users
    await request(app)
      .post("/api/auth/register")
      .send(admin);

    await request(app)
      .post("/api/auth/register")
      .send(userB);

    await request(app)
      .post("/api/auth/register")
      .send(userA);

    // Make admin an ADMIN
    const createdAdmin =
      await prisma.user.findUnique({
        where: {
          email: admin.email,
        },
      });

    expect(createdAdmin).not.toBeNull();

    await prisma.user.update({
      where: {
        id: createdAdmin!.id,
      },
      data: {
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });

    // Login as admin
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: admin.email,
        password: admin.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;

    // Request users sorted by name DESC
    const response = await request(app)
      .get("/api/users")
      .query({
        sortBy: "name",
        sortOrder: "desc",
        limit: 100,
      })
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);

    const users = response.body.users;

    expect(users).toBeInstanceOf(Array);

    // Find our test users
    const alice = users.find(
      (user: { email: string }) =>
        user.email === "alice-desc@example.com"
    );

    const bob = users.find(
      (user: { email: string }) =>
        user.email === "bob-desc@example.com"
    );

    expect(alice).toBeDefined();
    expect(bob).toBeDefined();

    // Bob should come before Alice
    expect(
      users.indexOf(bob)
    ).toBeLessThan(
      users.indexOf(alice)
    );
  });

  // ------------ Invalid Query Parameters Tests ------------

  // 9. Invalid page - GET /api/users?page=0
  it("should return 400 for an invalid page", async () => {

    // const accessToken =
    //   await getAdminAccessToken(
    //     "validation-admin@example.com"
    //   );

    const response = await request(app)
      .get("/api/users")
      .query({
        page: 0,
      })
      .set(
        "Authorization",
        `Bearer ${adminAccessToken}`
      );

    expect(response.status).toBe(400);
  });

  // 10. Invalid limit - Test for an invalid limit - GET /api/users?limit=101
  it("should return 400 when limit exceeds 100", async () => {
    // const accessToken =
    //   await getAdminAccessToken("validation-admin@example.com");

    const response = await request(app)
      .get("/api/users")
      .query({
        limit: 101,
      })
      .set(
        "Authorization",
        `Bearer ${adminAccessToken}`
      );

    expect(response.status).toBe(400);
  });


  // 11. Invalid role - Test for an invalid role filter - GET /api/users?role=INVALID
  it("should return 400 for an invalid role", async () => {
    // const accessToken =
    //   await getAdminAccessToken("validation-admin@example.com");

    const response = await request(app)
      .get("/api/users")
      .query({
        role: "INVALID",
      })
      .set(
        "Authorization",
        `Bearer ${adminAccessToken}`
      );

    expect(response.status).toBe(400);
  });


  // 12. Invalid sort field - Test for an invalid sort field - GET /api/users?sortOrder=invalid
  it("should return 400 for an invalid sort order", async () => {
    // const accessToken =
    //   await getAdminAccessToken("validation-admin@example.com");

    const response = await request(app)
      .get("/api/users")
      .query({
        sortOrder: "invalid",
      })
      .set(
        "Authorization",
        `Bearer ${adminAccessToken}`
      );

    expect(response.status).toBe(400);
  });

});


// B. GET /api/users/:id — get one user
describe("GET /api/users/:id", () => {

  let adminAccessToken: string;

  beforeEach(async () => {
    adminAccessToken = await getAdminAccessToken(
      "user-by-id-admin@example.com"
    );
  });

  // 1. Test for unauthenticated access - This checks that authMiddleware is working.
  it("should return 401 without authentication", async () => {
    const response = await request(app)
      .get("/api/users/1");

    expect(response.status).toBe(401);
  });

  // 2. Test for an invalid user ID - This checks that validateUserId middleware is working.
  it("should return 400 for an invalid user ID", async () => {
    const response = await request(app)
      .get("/api/users/invalid")
      .set(
        "Authorization",
        `Bearer ${adminAccessToken}`
      );

    expect(response.status).toBe(400);
  });


  // 3. Test for a user trying to access another user's profile - This checks that authorizeSelfOrAdmin middleware is working.
  it("should return 200 when a user accesses their own profile", async () => {
    const user = {
      name: "Self Test User",
      email: "self-test@example.com",
      password: "Password123",
    };

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    const createdUser = await prisma.user.findUnique({
  where: {
    email: user.email,
  },
});

expect(createdUser).not.toBeNull();

  await prisma.user.update({
    where: {
      id: createdUser!.id,
    },
    data: {
      emailVerifiedAt: new Date(),
    },
  });

    expect(createdUser).not.toBeNull();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);


    const accessToken =
      loginResponse.body.accessToken;

    const response = await request(app)
      .get(`/api/users/${createdUser!.id}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty(
      "message"
    );

    expect(response.body).toHaveProperty(
      "user"
    );

    expect(response.body.user.id).toBe(
      createdUser!.id
    );

    expect(response.body.user.email).toBe(
      user.email
    );

    expect(response.body.user).not.toHaveProperty(
      "password"
    );
  });


  // 4. Test for a user trying to access another user's profile - This checks that authorizeSelfOrAdmin middleware is working.
  it("should return 403 when a user accesses another user's profile", async () => {
    const userA = {
      name: "User A",
      email: "user-a@example.com",
      password: "Password123",
    };

    const userB = {
      name: "User B",
      email: "user-b@example.com",
      password: "Password123",
    };

    await request(app)
      .post("/api/auth/register")
      .send(userA);

    await request(app)
      .post("/api/auth/register")
      .send(userB);

    const createdUserA =
      await prisma.user.findUnique({
        where: {
          email: userA.email,
        },
      });

    const createdUserB =
      await prisma.user.findUnique({
        where: {
          email: userB.email,
        },
      });

    expect(createdUserA).not.toBeNull();
    expect(createdUserB).not.toBeNull();

    // User A must be verified because User A needs to log in
    await prisma.user.update({
      where: {
        id: createdUserA!.id,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    });


    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: userA.email,
        password: userA.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;

    // User A tries to access User B
    const response = await request(app)
      .get(`/api/users/${createdUserB!.id}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    expect(response.status).toBe(403);
  });

  // 5. Test for an admin accessing another user's profile - This checks that authorizeSelfOrAdmin middleware allows admins to access any user's profile.
  it("should return 200 when an admin accesses another user's profile", async () => {
    const user = {
      name: "Admin Target User",
      email: "admin-target@example.com",
      password: "Password123",
    };

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(registerResponse.status).toBe(201);

    const createdUser =
      await prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });

    expect(createdUser).not.toBeNull();

    const response = await request(app)
      .get(`/api/users/${createdUser!.id}`)
      .set(
        "Authorization",
        `Bearer ${adminAccessToken}`
      );

    expect(response.status).toBe(200);

    expect(response.body.user.id).toBe(
      createdUser!.id
    );

    expect(response.body.user.email).toBe(
      user.email
    );

    expect(response.body.user).not.toHaveProperty(
      "password"
    );
  });


  // 6. Test for a non-existent user ID - This checks that the getUserById service throws an AppError with a 404 status code when the user is not found.
  it("should return 404 if the user does not exist", async () => {
    const response = await request(app)
      .get("/api/users/999999")
      .set(
        "Authorization",
        `Bearer ${adminAccessToken}`
      );

    expect(response.status).toBe(404);
  });
});


// C. PATCH /api/users/:id — update user profile (name, email)
describe("PATCH /api/users/:id", () => {

  it("should allow a user to update their own profile", async () => {

    // Step 1- Register a new user
    const user = {
      name: "John Doe",
      email: "john-update@example.com",
      password: "Password123",
    };

    await request(app)
      .post("/api/auth/register")
      .send(user);

    
// Test setup: verify the user so login is allowed
const createdUser =
  await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

expect(createdUser).not.toBeNull();

await prisma.user.update({
  where: {
    id: createdUser!.id,
  },
  data: {
    emailVerifiedAt: new Date(),
  },
});

    // Step 2 — Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;


    // Step 4 — Update the user's profile
    const response = await request(app)
      .patch(`/api/users/${createdUser!.id}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
      .send({
        name: "John Updated",
        email: "john-updated@example.com",
      });

    // Step 5 — Assertions
    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.user.name)
      .toBe("John Updated");

    expect(response.body.user.email)
      .toBe("john-updated@example.com");

    
    // Step 6 — Verify the changes in the database
    const updatedUser =
      await prisma.user.findUnique({
        where: {
          id: createdUser!.id,
        },
      });

    expect(updatedUser?.name)
      .toBe("John Updated");

    expect(updatedUser?.email)
      .toBe("john-updated@example.com");

  });

});


// D. Admin updates another user's profile
describe("PATCH /api/users/:id/role", () => {

  // Admin updates another user's profile
  it("should allow an admin to update another user's role", async () => {

    // Step 1 — Create an admin
    const admin = {
      name: "Admin User",
      email: "admin-update@example.com",
      password: "Password123",
    };

    await request(app)
      .post("/api/auth/register")
      .send(admin);

    
    // Step 2. Promote to ADMIN
    const createdAdmin =
      await prisma.user.findUnique({
        where: {
          email: admin.email,
        },
      });

    expect(createdAdmin).not.toBeNull();

    await prisma.user.update({
      where: {
        id: createdAdmin!.id,
      },
      data: {
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });


    // Step 3. Login as admin
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: admin.email,
        password: admin.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;

      
    // Step 4. Create the target user
    const targetUser = {
      name: "Normal User",
      email: "target-user@example.com",
      password: "Password123",
    };

    await request(app)
      .post("/api/auth/register")
      .send(targetUser);

    const createdTarget =
      await prisma.user.findUnique({
        where: {
          email: targetUser.email,
        },
      });

    expect(createdTarget).not.toBeNull();


    // Step 5. Update the target
    const response = await request(app)
      .patch(`/api/users/${createdTarget!.id}/role`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
      .send({
        role: "ADMIN",
      });

    // Step 6. Assertions
    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.user.role)
      .toBe("ADMIN");


    // Step 7. Verify the database
    const updatedUser =
      await prisma.user.findUnique({
        where: {
          id: createdTarget!.id,
        },
      });

    expect(updatedUser?.role)
      .toBe("ADMIN");
  });

  // Regular user cannot change another user's role - 403 Forbidden
  it("should return 403 when a regular user tries to update another user's role", async () => {

    // Step 1 — Create a regular user
    const userA = {
      name: "User A",
      email: "user-a-role@example.com",
      password: "Password123",
    };

    await request(app)
      .post("/api/auth/register")
      .send(userA);

    const createdUserA = await prisma.user.findUnique({
  where: {
    email: userA.email,
  },
});

expect(createdUserA).not.toBeNull();

await prisma.user.update({
  where: {
    id: createdUserA!.id,
  },
  data: {
    emailVerifiedAt: new Date(),
  },
});

    // login as userA
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: userA.email,
        password: userA.password,
      });
    const accessToken =
      loginResponse.body.accessToken;

    // Step 2 — Create another user B
    const userB = {
      name: "User B",
      email: "user-b-role@example.com",
      password: "Password123",
    };

    await request(app)
      .post("/api/auth/register")
      .send(userB);

    const createdUser =
      await prisma.user.findUnique({
        where: {
          email: userB.email,
        },
      });

    expect(createdUser).not.toBeNull();

    // Step 3 — Try changing the role; Attempt to update user B's role as user A
    const response = await request(app)
      .patch(`/api/users/${createdUser!.id}/role`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
      .send({
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      });

    // Step 4 — Assertions
    expect(response.status).toBe(403);

    expect(response.body.success).toBe(false);
  })

  // Test --- Invalid role - This tests validateRole.  --------
  it("should return 400 for an invalid role", async () => {

    const accessToken =
      await getAdminAccessToken(
        "validation-admin@example.com"
      );

    await request(app)
        .post("/api/auth/register")
        .send({
          name: "Target User",
          email: "target-invalid-role@example.com",
          password: "Password123",
        });

      const createdTarget =
        await prisma.user.findUnique({
          where: {
            email: "target-invalid-role@example.com",
          },
        });

      expect(createdTarget).not.toBeNull();

    // Request
    const response = await request(app)
    .patch(`/api/users/${createdTarget!.id}/role`)
    .set(
      "Authorization",
      `Bearer ${accessToken}`
    )
    .send({
      role: "SUPER_ADMIN",
    });
    // Assertions
    expect(response.status).toBe(400);
    
    expect(response.body.message).toContain("Role");
  });


  // ---- Test -User not found --------
  it("should return 404 when the user does not exist", async () => {      
    const accessToken =
      await getAdminAccessToken(
        "validation-admin@example.com"
      );
      
    const response = await request(app)
    .patch("/api/users/999999/role")
    .set(
      "Authorization",
      `Bearer ${accessToken}`
    )
    .send({
      role: "ADMIN",
    });
    
    expect(response.status).toBe(404);
  });

  // ------- Test - Invalid ID ---------
  it("should return 400 when the user ID is invalid", async () => {
    const accessToken =
      await getAdminAccessToken(
        "validation-admin@example.com"
      );
      
    const response = await request(app)
      .patch("/api/users/abc/role")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
    .send({
      role: "ADMIN",
    });

  expect(response.status).toBe(400);
  })

});


// E. DELETE /api/users/:id — delete user profile (self or admin)
describe("DELETE /api/users/:id", () => {

  // Test 1. Admin can delete a user
  it("should allow an admin to delete a user", async () => {
    // Create the target user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Delete User",
        email: "delete-user@example.com",
        password: "Password123",
      });

    const targetUser =
      await prisma.user.findUnique({
        where: {
          email: "delete-user@example.com",
        },
      });

    expect(targetUser).not.toBeNull();

    const accessToken =
      await getAdminAccessToken(
        "delete-admin@example.com"
      );


    // Delete the user
    const response = await request(app)
      .delete(`/api/users/${targetUser!.id}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      )
    
    // Assertions
    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    // Verify the user is deleted
    const deletedUser =
      await prisma.user.findUnique({
        where: {
          id: targetUser!.id,
        },
      });

    expect(deletedUser).toBeNull();
  });

  // Test 2. Regular user can delete their own profile
  it("should allow a regular user to delete their own profile", async () => {
    // Create a regular user
    const user = {
      name: "Self Delete User",
      email: "self-delete-user@example.com",
      password: "Password123",
    };
    await request(app)
      .post("/api/auth/register")
      .send(user);

    // Step 2. Find the created user
    const selfDeleteUser =
      await prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });

    expect(selfDeleteUser).not.toBeNull();


// Test setup: verify the user so login is allowed
await prisma.user.update({
  where: {
    id: selfDeleteUser!.id,
  },
  data: {
    emailVerifiedAt: new Date(),
  },
});


    // Step 3. Login as that user
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(loginResponse.status).toBe(200);

    const accessToken =
      loginResponse.body.accessToken;

    // Delete the user
    const response = await request(app)
      .delete(`/api/users/${selfDeleteUser!.id}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    // Assertions
    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    // Verify the user is deleted
    const deletedUser =
      await prisma.user.findUnique({
        where: {
          id: selfDeleteUser!.id,
        },
      });

    expect(deletedUser).toBeNull();
  });

  // Test 3. Regular user tries deleting another user → 403
  it("should return 403 when a regular user tries to delete another user", async () => {
    // Step 1. Create User A
    const userA = {
      name: "User A",
      email: "user-a-delete@example.com",
      password: "Password123",
    };

    await request(app)
      .post("/api/auth/register")
      .send(userA);

    // Verify User A so login is allowed
const createdUserA =
  await prisma.user.findUnique({
    where: {
      email: userA.email,
    },
  });

expect(createdUserA).not.toBeNull();

await prisma.user.update({
  where: {
    id: createdUserA!.id,
  },
  data: {
    emailVerifiedAt: new Date(),
  },
});


    // Step 2. Login User A
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: userA.email,
        password: userA.password,
      });

    const accessToken =
      loginResponse.body.accessToken;
      
    // Step 3. Create User B
    const userB = {
      name: "User B",
      email: "user-b-delete@example.com",
      password: "Password123",
    };

    await request(app)
      .post("/api/auth/register")
      .send(userB);

    const createdUser =
      await prisma.user.findUnique({
        where: {
          email: userB.email,
        },
      });

    expect(createdUser).not.toBeNull();

    // Attempt to delete the user
    const response = await request(app)
      .delete(`/api/users/${createdUser!.id}`)
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );

    // Assertions
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // Test 4. User not found → 404; This directly exercises:
  //
  //if (!user) {
  //  throw new AppError("User not found", 404);
  //}

  it("should return 404 when trying to delete a non-existent user", async () => {
    const accessToken =
      await getAdminAccessToken(
        "admin-user@example.com"
      );

    const response = await request(app)
      .delete("/api/users/999999")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );
    expect(response.status).toBe(404);
  });

  // Test 5. Invalid user ID → 400; This directly exercises: validateUserId
  
  it("should return 400 when trying to delete with an invalid user ID", async () => {
    const accessToken =
      await getAdminAccessToken(
        "admin-user@example.com"
      );

    const response = await request(app)
      .delete("/api/users/invalid-id")
      .set(
        "Authorization",
        `Bearer ${accessToken}`
      );
    expect(response.status).toBe(400);
  });
});


// Disconnect Prisma after all tests are done
afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "regular-user@example.com",
          "admin-user@example.com",
          "pagination-admin@example.com",
          "role-filter-admin@example.com",
          "role-filter-user@example.com",
          "search-admin@example.com",
          "john@example.com",
          "jane@example.com",
          "sort-admin@example.com",
          "alice@example.com",
          "bob@example.com",
          "sort-desc-admin@example.com",
          "alice-desc@example.com",
          "bob-desc@example.com",
          "users-test-admin@example.com",
        ],
      },
    },
  });

  await prisma.$disconnect();
});
