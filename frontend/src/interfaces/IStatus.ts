import { IBaseEntity } from "./IBaseEntity";
import { IKanban } from "./IKanban";

export interface IStatus extends IBaseEntity {
  name: string;
  color: string;
  kanban?: IKanban;
}
