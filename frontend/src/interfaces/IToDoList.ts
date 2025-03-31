import { IBaseEntity } from "./IBaseEntity";
import { ITask } from "./ITask";
import { IToDoItem } from "./IToDoItem";

export interface IToDoList extends IBaseEntity {
  name: string;
  items: IToDoItem[];
  task: ITask;
}
