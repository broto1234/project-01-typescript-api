export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// export interface CreateUser {
//   name: string;
//   email: string;
//   password: string;
// }

// type Login = {
//   email: string;
//   password: string;
// };

// export interface UpdateUser {
//   name?: string;
//   email?: string;
// }

export interface LoginResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateUserRole {
  role: Role;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}