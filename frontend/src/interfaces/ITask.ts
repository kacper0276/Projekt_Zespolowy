import { IBaseEntity } from "./IBaseEntity";
import { IColumnEntity } from "./IColumnEntity";
import { IKanban } from "./IKanban";
import { IRow } from "./IRow";
import { IToDoList } from "./IToDoList";
import { IUser } from "./IUser";

export interface ITask extends IBaseEntity {
  name: string;
  description: string;
  status: string;
  priority: string;
  deadline: Date;
  order: number;
  users: IUser[];
  column: IColumnEntity;
  row: IRow;  
  toDoLists: IToDoList[];
  kanbans: IKanban[];
}
