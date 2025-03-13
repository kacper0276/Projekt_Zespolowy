import { IBaseEntity } from "./IBaseEntity";
import { IKanban } from "./IKanban";
import { ITask } from "./ITask";

export interface IColumnEntity extends IBaseEntity {
  name: string;
  status?: string;
  tasks?: ITask[];
  order: number;
  maxTasks: number;
  kanban?: IKanban;
}
