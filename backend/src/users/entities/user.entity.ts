import { BaseEntity } from '../../entities/base.entity';
import { Role } from '../../enums/role.enum';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Kanban } from '../../kanban/entities/kanban.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { Message } from '../../messages/entities/message.entity';
import { KanbanSetting } from '../../kanban-settings/entities/kanban-setting.entity';
import { TeamInvite } from '../../teams/entities/team-invite.entity';
import { Team } from '../../teams/entities/team.entity';
import { Comment } from '../../comments/entity/comment.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, unique: true })
  login: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'longtext', nullable: true })
  profileImage: string;

  @Column({ type: 'longtext', nullable: true })
  backgroundImage: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: 0 })
  maxTasks: number;

  @ManyToMany(() => Kanban, (kanban) => kanban.users)
  kanbans: Kanban[];

  @ManyToMany(() => Task, (task) => task.users)
  tasks: Task[];

  @ManyToMany(() => Conversation, (conversation) => conversation.participants)
  conversations: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => KanbanSetting, (kanbanSetting) => kanbanSetting.user)
  kanbanSettings: KanbanSetting[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => TeamInvite, (invite) => invite.user)
  teamInvites: TeamInvite[];

  @ManyToMany(() => Team, (team) => team.users)
  @JoinTable()
  teams: Team[];
}
