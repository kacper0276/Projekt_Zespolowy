import { InviteStatus } from '../../enums/invite-status.enum';
import { User } from '../../users/entities/user.entity';
import { Entity, ManyToOne, Column } from 'typeorm';
import { Team } from './team.entity';
import { BaseEntity } from '../../entities/base.entity';

@Entity('team_invites')
export class TeamInvite extends BaseEntity {
  @ManyToOne(() => User, (user) => user.teamInvites)
  user: User;

  @ManyToOne(() => Team, (team) => team.invites)
  team: Team;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({ nullable: false })
  invitedBy: number;
}
