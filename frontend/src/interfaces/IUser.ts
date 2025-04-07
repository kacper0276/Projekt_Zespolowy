import { IKanbanSettings } from "./IKanbanSettings";
import { ITeam } from "./ITeam";
import { ITeamInvite } from "./ITeamInvite";

export interface IUser {
  email: string;
  login: string;
  isActivated: boolean;
  password: string;
  role: string;
  id: number;
  firstName: string | null;
  lastname: string | null;
  isOnline: boolean;
  maxTasks: number;
  kanbanSettings: IKanbanSettings[];
  teamInvites: ITeamInvite[];
  teams: ITeam[];
}
