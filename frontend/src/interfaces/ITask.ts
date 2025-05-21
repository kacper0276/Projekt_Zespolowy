import { IBaseEntity } from "./IBaseEntity";
import { IColumnEntity } from "./IColumnEntity";
import { IComment } from "./IComment";
import { IKanban } from "./IKanban";
import { IRow } from "./IRow";
import { IStatus } from "./IStatus";
import { IToDoList } from "./IToDoList";
import { IUser } from "./IUser";

export interface ITask extends IBaseEntity {
  name: string;
  description: string;
  status: IStatus;
  priority: string;
  deadline: Date;
  order: number;
  users: IUser[];
  column: IColumnEntity;
  row: IRow;
  toDoLists: IToDoList[];
  kanbans: IKanban[];
  lastColumnName?: string;
  lastMovedToColumnAt?: Date;
  comments: IComment[];
}
