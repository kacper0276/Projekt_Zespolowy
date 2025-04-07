import { IBaseEntity } from "./IBaseEntity";
import { ITeamInvite } from "./ITeamInvite";
import { IUser } from "./IUser";

export interface ITeam extends IBaseEntity {
  name: string;
  invites: ITeamInvite[];
  users: IUser[];
}
