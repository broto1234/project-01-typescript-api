// import { User } from "@prisma/client";
import { PublicUser, User } from "../types/user.types";

export function toPublicUser(user: User): PublicUser {
  const { password, ...publicUser } = user;
  return publicUser;
}