import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",

    // API metadata - gives your API documentation a name and version.
    info: {
      title: "TypeScript REST API",
      version: "1.0.0",
      description:
        "A RESTful API built with Express, TypeScript, Prisma, PostgreSQL, JWT authentication, role-based authorization, Zod validation, and Swagger documentation.",
    },

    // Server information - specifies the server URL and description for your API. Where your API is running locally.
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "User registration, login, and authentication endpoints.",
      },
      {
        name: "Users",
        description: "Operations for managing user accounts.",
      },
    ],


    // Security schemes - defines the security scheme for your API. In this case, it's a bearer token (JWT) authentication scheme.
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN"],
              example: "USER",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 8,
              example: "Password123",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john.updated@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 1,
              example: "Password123",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIs...",
            },
            refreshToken: {
              type: "string",
              example: "d3f8d2f3e4c5...",
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 10,
            },
            totalItems: {
              type: "integer",
              example: 57,
            },
            totalPages: {
              type: "integer",
              example: 6,
            },
          },
        },
        UserListResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Users fetched successfully",
            },
            users: {
              type: "array",
              items: {
                $ref: "#/components/schemas/User",
              },
            },
            pagination: {
              $ref: "#/components/schemas/Pagination",
            },
          },
        },
        PublicUser: {
          type: "object",
          properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            example: "john@example.com",
          },
          role: {
            type: "string",
            example: "USER",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
          },
        },
        UpdateUserRequest: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              example: "John Updated",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.updated@example.com",
            },
          },
        },
        UpdateRoleRequest: {
          type: "object",
          required: ["role"],
          additionalProperties: false,
          properties: {
            role: {
              type: "string",
              enum: ["USER", "ADMIN"],
              example: "ADMIN",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Invalid email or password",
            },
          },
        },
      },
    },
  },

  // API files to be scanned for documentation - specifies the paths to the files that contain your API routes and controllers. Swagger will scan these files for JSDoc comments to generate the API documentation.
  apis: [
    "./src/routes/*.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;