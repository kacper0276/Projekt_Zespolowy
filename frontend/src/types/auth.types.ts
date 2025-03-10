import { Role } from "../enums/role.enum";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  login: string;
  password: string;
  repeatedPassword: string;
  firstName?: string;
  lastName?: string;
  role: Role;
}
