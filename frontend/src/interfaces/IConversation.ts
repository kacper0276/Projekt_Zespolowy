import { IBaseEntity } from "./IBaseEntity";
import { IMessage } from "./IMessage";
import { IUser } from "./IUser";

export interface IConversation extends IBaseEntity {
  participants: IUser[];
  messages: IMessage[];
  groupName: string;
  isGroupChat: boolean;
  isActive: boolean;
}
