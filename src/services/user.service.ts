import { UpdateUserRole, PublicUser, Role } from '../types/user.types';
import { UpdateUser, UserListQuery } from '../schemas/user.schema';
import AppError from '../utils/AppError';
import prisma from '../lib/prisma';
import { toPublicUser } from '../utils/publicUser';

export const getAllUsers = async ( query: UserListQuery ): Promise<{
    users: PublicUser[];
    pagination: {
      page: number;
      limit: number;
      totalUsers: number;
      totalPages: number;
    };
  }> => {

    //Because 'sortBy' is optional in your TypeScript interface: sortBy?: could be undefined. So we provide a default value of "id" if it's not provided in the query. 
    // Same for 'sortOrder'.

    // Destructure query parameters with default values for sortBy and sortOrder
    const { page, limit, search, role, sortBy="id", sortOrder="asc" } = query;

    // Calculate the number of records to skip based on the current page and limit
    const skip = (page - 1) * limit;

    // Construct the 'where' clause for filtering users based on search and role
    const where = {
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),

      ...(role && {
        role,
      }),
    };

    // Use Promise.all to execute both database queries (findMany and count) concurrently for efficiency
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      prisma.user.count({
        where,
      }),
    ]);

    // Map the users to exclude the password field before returning them
    const publicUsers = users.map(toPublicUser);

    // Return the public users along with pagination information
    return {
      users: publicUsers,

      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
};


export const getUserById = async (id: number): Promise<PublicUser> => {

  // 1. Find user by ID
  const user = await prisma.user.findUnique({
    where: { id },
  });

  // 2. User not found - throw error
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 3. user without password
  // const {
  //   password: _password,
  //   ...publicUser
  // } = user;

  // 4. Return user without password
  //return publicUser;

  // 3 + 4 
  return toPublicUser(user);
};


export const updateUser = async (
  id: number,
  data: UpdateUser
): Promise<PublicUser> => {

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { id },
  });

  // 2. User not found - throw error
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 3. Check if email is changing
  if (data.email && data.email !== user.email) {     // Prevents unnecessary database queries.

    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(
        "Email already exists",
        409
      );
    }
  }

  // 4. Update user
  const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

  // 5. user without password
  // const {
  //   password: _password,
  //   ...publicUser
  // } = updatedUser;

  // 6. Return updated user without password
  //return publicUser;
  return toPublicUser(updatedUser);
};


// admin-only role management.
export const updateUserRole = async (
  id: number,
  data: UpdateUserRole
): Promise<PublicUser> => {

  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      role: data.role,
    },
  });

  return toPublicUser(user);
};

// Find the user whose ID is id and delete that user.
export const deleteUser = async (
  id: number
): Promise<void> => {
  
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await prisma.user.delete({
    where: {
      id,
    },
  });
};

// Why Promise.all()?
// 
// We need two database operations:
// 
// prisma.user.findMany() and prisma.user.count()
// 
// They don't depend on each other.
// 
// So instead of:
// 
// const users = await prisma.user.findMany();
// 
// const totalUsers = await prisma.user.count();

//We use:
//const [ users, totalUsers,] = await Promise.all([
//  prisma.user.findMany(...),
//  prisma.user.count(),
//]);