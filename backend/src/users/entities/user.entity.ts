import { BaseEntity } from '../../entities/base.entity';
import { Role } from '../../enums/role.enum';
import { Column, Entity, ManyToMany } from 'typeorm';
import { Kanban } from '../../kanban/entities/kanban.entity';
import { Task } from '../../tasks/entities/task.entity';

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

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @ManyToMany(() => Kanban, (kanban) => kanban.users)
  kanbans: Kanban[];

  @ManyToMany(() => Task, (task) => task.users)
  tasks: Task[];
}
