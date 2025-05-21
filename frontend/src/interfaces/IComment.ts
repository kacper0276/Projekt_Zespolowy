import { IBaseEntity } from "./IBaseEntity";
import { ITask } from "./ITask";
import { IUser } from "./IUser";

export interface IComment extends IBaseEntity {
  content: string;
  user: IUser;
  task: ITask;
}
