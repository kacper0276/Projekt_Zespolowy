import { IBaseEntity } from "./IBaseEntity";
import { IColumnEntity } from "./IColumnEntity";
import { IToDoList } from "./IToDoList";
import { IUser } from "./IUser";

export interface ITask extends IBaseEntity {
  name: string;
  description: string;
  status: string;
  priority: string;
  deadline: Date;
  users: IUser[];
  column: IColumnEntity;
  toDoList: IToDoList;
}
