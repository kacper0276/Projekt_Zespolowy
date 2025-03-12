import { IBaseEntity } from "./IBaseEntity";
import { IColumnEntity } from "./IColumnEntity";
import { IStatus } from "./IStatus";
import { ITask } from "./ITask";
import { IUser } from "./IUser";

export interface IKanban extends IBaseEntity {
  tableName: string;
  users: IUser[];
  tasks: ITask[];
  columns: IColumnEntity[];
  statuses: IStatus[];
}
