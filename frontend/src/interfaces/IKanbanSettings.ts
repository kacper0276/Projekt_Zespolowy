import { IBaseEntity } from "./IBaseEntity";
import { IKanban } from "./IKanban";
import { IUser } from "./IUser";

export interface IKanbanSettings extends IBaseEntity {
  kanban: IKanban;
  user: IUser;
  wipLimit: number;
}
