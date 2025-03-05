import { Role } from 'src/enums/role.enum';

export type registerData = {
  email: string;
  login: string;
  password: string;
  repeatedPassword: string;
  firstName?: string;
  lastName?: string;
  role: Role;
};
