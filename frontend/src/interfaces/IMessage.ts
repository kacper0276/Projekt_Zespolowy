import { IBaseEntity } from "./IBaseEntity";
import { IConversation } from "./IConversation";
import { IUser } from "./IUser";

export interface IMessage extends IBaseEntity {
  senderId: number;
  content: string;
  createdAt: Date;
  conversation?: IConversation;
  sender?: IUser;
  isRead: boolean;
  senderName?: string;
  isCurrentUser?: boolean;
}
