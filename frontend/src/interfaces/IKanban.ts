import { IBaseEntity } from "./IBaseEntity";
import { IColumnEntity } from "./IColumnEntity";
import { IRow } from "./IRow";
import { IStatus } from "./IStatus";
import { ITask } from "./ITask";
import { IUser } from "./IUser";

export interface IKanban extends IBaseEntity {
  tableName: string;
  users?: IUser[];
  tasks?: ITask[];
  columns: IColumnEntity[];
  rows: IRow[];
  statuses: IStatus[];
  backgroundImage: string | null;
}
