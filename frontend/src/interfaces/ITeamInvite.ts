import { InviteStatus } from "../enums/invite-status.enum";
import { IBaseEntity } from "./IBaseEntity";
import { ITeam } from "./ITeam";
import { IUser } from "./IUser";

export interface ITeamInvite extends IBaseEntity {
  user: IUser;
  team: ITeam;
  status: InviteStatus;
  invitedBy: number;
  invitedByUser?: IUser;
}
