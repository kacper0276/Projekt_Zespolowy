import { BaseEntity } from '../../entities/base.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { TeamInvite } from './team-invite.entity';
import { User } from '../../users/entities/user.entity';

@Entity('teams')
export class Team extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => TeamInvite, (invite) => invite.team)
  invites: TeamInvite[];

  @ManyToMany(() => User, (user) => user.teams)
  users: User[];
}
