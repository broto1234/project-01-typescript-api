// Import Router from express
// Create a router
// Add a GET route
// Export the router

import { Router } from 'express';
import { getAllUsers, deleteUser, getUserById, updateUser, updateUserRole } from '../controllers/user.controller';
// import validateCreateUser from '../middleware/validateCreateUser';
import validateUserId from '../middleware/validateUserId';
import validateRole from '../middleware/validateRole';

import authMiddleware from '../middleware/authMiddleware';
// import authorizeUser from '../middleware/authorizeUser';
import authorizeRoles from '../middleware/authorizeRoles';
import authorizeSelfOrAdmin from '../middleware/authorizeSelfOrAdmin';
import validate from '../middleware/validate';
import { updateUserSchema, userListQuerySchema } from '../schemas/user.schema';
import validateQuery from '../middleware/validateQuery';

import asyncHandler from '../utils/asyncHandler';

// Create a router
const userRouter = Router();

// ---- Define routes with CRUD operations ----

//Express knows: "Any error from this controller should go to error middleware." Now the route is protected.
// admin-only role management - authorizeRoles("ADMIN") : Only ADMIN can get users.
// GET    /users       → Get all users Ex.-flow: 1. If authMiddleware fails, authorizeRoles("ADMIN") never runs. 2. If authorizeRoles("ADMIN") fails, the controller never runs. 3. That's the benefit of middleware.

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a paginated list of users. Admin access only.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of users per page
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum:
 *             - USER
 *             - ADMIN
 *         description: Filter by user role
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - id
 *             - name
 *             - email
 *             - createdAt
 *           default: id
 *         description: Sort field
 *
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           default: asc
 *         description: Sort direction
 *
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get('/', authMiddleware, authorizeRoles("ADMIN"), validateQuery(userListQuerySchema), asyncHandler(getAllUsers));  

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Returns a user by ID. A user can access their own profile, while an admin can access any user's profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User with ID 1 fetched successfully
 *                 user:
 *                   $ref: '#/components/schemas/PublicUser'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET    /users/:id   → Get one user
userRouter.get('/:id', authMiddleware, validateUserId, authorizeSelfOrAdmin, asyncHandler(getUserById));


//--------NO NEED this route because it's for registration. We don't want to require authentication for new users to 'register'---------
// POST   /users       → Create user 
// userRouter.post('/', validateCreateUser, asyncHandler(createUser));
//--------


/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user profile
 *     description: Allows a user to update their own profile or an admin to update any user's profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User with ID 1 updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/PublicUser'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// update profile (name, email)
// PATCH  /users/:id   → Update user  
userRouter.patch('/:id', authMiddleware, validateUserId, authorizeSelfOrAdmin, validate(updateUserSchema), asyncHandler(updateUser));

//  This gives us a very clean security chain:
// Authentication - authMiddleware -- Checks the JWT, JWT valid?
//       ↓
// URL Parameter Validation - validateUserId -- ID valid?
//       ↓
// Authorization - authorizeSelfOrAdmin -- Does JWT user own this ID?
//       ↓
// Body Validation - validate(updateUserSchema) -- Is the request body valid according to the updateUserSchema?
//       ↓
// Controller - updateUser -- If all previous middleware passed, this controller will execute and update the user in the database.


/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     description: Allows an administrator to change a user's role.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User with ID 1 role updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/PublicUser'
 *       400:
 *         description: Invalid user ID or invalid role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// update role (admin only) - A regular user can update their own profile but cannot change their role.
// Only admins can access /users/:id/role.
// PATCH  /users/:id/role   → Update user role Only ADMIN can update user role.
userRouter.patch('/:id/role', authMiddleware, validateUserId, authorizeRoles("ADMIN"), validateRole, asyncHandler(updateUserRole));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Allows a user to delete their own account or an administrator to delete any user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User with ID 1 deleted successfully
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// DELETE /users/:id   → Delete user
userRouter.delete('/:id', authMiddleware, validateUserId, authorizeSelfOrAdmin, asyncHandler(deleteUser));

// Export the router
export default userRouter;


//------------------ Work flow of validateUserId: -----------------

//PUT /users/abc
//       │
//       ▼
//validateUserId
//       │
//       ├── Invalid → 400 Response
//       │
//       └── Valid
//             │
//             ▼
//        asyncHandler
//             │
//             ▼
//        updateUser
//             │
//             ▼
//        userService
//             │
//             ▼
//          Prisma


// --------- Work flow of asyncHandler and errorHandler: ----------

// Request
//  ↓
// Route
//  ↓
// Validation Middleware
//  ↓
// Async Handler
//  ↓
// Controller
//  ↓
// Service
//  ↓
// Database
//  ↓
// Error Handler

// ------------------ Work flow of authMiddleware & authorizeUser Middleware: -----------------
//PUT /users/3
//       │
//       ▼
//authMiddleware
//       │
//       │ JWT valid?
//       │
//       ▼
//req.userId = 3
//       │
//       ▼
//validateUserId
//       │
//       │ Is URL ID valid?
//       │
//       ▼
//authorizeSelfOrAdmin
//       │
//       │ Does JWT user own this ID?
//       │
//       ▼
//validateUpdateUser
//       │
//       ▼
//updateUser controller
