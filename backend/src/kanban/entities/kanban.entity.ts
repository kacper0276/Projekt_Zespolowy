import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../entities/base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { ColumnEntity } from '../../columns/entities/column.entity';
import { Status } from '../../status/entities/status.entity';

@Entity('kanbans')
export class Kanban extends BaseEntity {
  @Column()
  tableName: string;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];

  @ManyToMany(() => Task)
  @JoinTable()
  tasks: Task[];

  @OneToMany(() => ColumnEntity, (column) => column.kanban)
  columns: ColumnEntity[];

  @OneToMany(() => Status, (status) => status.kanban)
  statuses: Status[];
}
