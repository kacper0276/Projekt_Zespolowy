import { IBaseEntity } from "./IBaseEntity";
import { IToDoList } from "./IToDoList";

export interface IToDoItem extends IBaseEntity {
  name?: string;
  isDone: boolean;
  toDoList: IToDoList;
  subItems: IToDoItem[];
  parentItem?: IToDoItem;
}
