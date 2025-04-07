import { BaseEntity } from 'src/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { TeamInvite } from './team-invite.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('teams')
export class Team extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => TeamInvite, (invite) => invite.team)
  invites: TeamInvite[];

  @OneToMany(() => User, (user) => user.teams)
  users: User[];
}
