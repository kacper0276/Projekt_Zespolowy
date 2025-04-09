import { IBaseEntity } from "./IBaseEntity";
import { IKanban } from "./IKanban";
import { ITask } from "./ITask";

export interface IStatus extends IBaseEntity {
  name: string;
  color: string;
  kanban?: IKanban;
  tasks?: ITask[];
}
