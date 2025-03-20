export interface IUser {
  email: string;
  login: string;
  isActivated: boolean;
  password: string;
  role: string;
  id: number;
  firstName: string | null;
  lastname: string | null;
  isOnline: boolean;
}
