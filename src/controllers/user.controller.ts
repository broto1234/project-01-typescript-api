// Controller function to handle fetching users

import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { UpdateUser, UpdateUserRole } from '../types/user.types';
import { UserListQuery } from '../schemas/user.schema';


const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {

  const query: UserListQuery = res.locals.query;
  
  // const {
  //   page,
  //   limit,
  //   search,
  //   role
  // }: UserListQuery = res.locals.query;
  

  const result = await userService.getAllUsers(query);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    users: result.users,
    pagination: result.pagination,
  });
};



const getUserById = async (req: Request, res: Response): Promise<void> => {
  
  const id = Number(req.params.id);

  const user = await userService.getUserById(id);

  res.json({ success: true, message: `User with ID ${id} fetched successfully`, user });
}


// const createUser = async (req: Request, res: Response): Promise<void> => {

//   const newUser: CreateUser = req.body;

//   const user = await userService.createUser(newUser);
  
//   res.status(201).json({ 
//     message: 'User created successfully', 
//     user,
//   });
  
// }


const updateUser = async (req: Request, res: Response): Promise<void> => {

  const id = Number(req.params.id);
  const updatedUser: UpdateUser = res.locals.body;

  const user = await userService.updateUser(id, updatedUser);

  res.status(200).json({ success: true, message: `User with ID ${id} updated successfully`, user });
}



export const updateUserRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = Number(req.params.id);

  const data: UpdateUserRole = req.body;

  const user = await userService.updateUserRole(
    id,
    data
  );

  res.status(200).json({
    success: true,
    message: `User with ID ${id} role updated successfully`,
    user, 
  });
};


const deleteUser = async (req: Request, res: Response): Promise<void> => {
  
  const id = Number(req.params.id);

  await userService.deleteUser(id);

  res.status(200).json({ 
    success: true,
    message: `User with ID ${id} deleted successfully`
  });
}

export { getAllUsers, getUserById, updateUser, deleteUser };