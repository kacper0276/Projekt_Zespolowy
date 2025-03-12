import { IBaseEntity } from "./IBaseEntity";
import { ITask } from "./ITask";

export interface IToDoList extends IBaseEntity {
  name: string;
  tasks: ITask[];
}
