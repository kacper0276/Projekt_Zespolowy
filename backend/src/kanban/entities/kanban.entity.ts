import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../entities/base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { ColumnEntity } from '../../columns/entities/column.entity';
import { Status } from '../../status/entities/status.entity';
import { Row } from 'src/rows/entities/row.entity';
import { KanbanSetting } from 'src/kanban-settings/entities/kanban-setting.entity';

@Entity('kanbans')
export class Kanban extends BaseEntity {
  @Column()
  tableName: string;

  @Column({ type: 'longtext' })
  backgroundImage: string;

  @ManyToMany(() => User, (user) => user.kanbans)
  @JoinTable()
  users: User[];

  @ManyToMany(() => Task, (task) => task.kanbans)
  @JoinTable()
  tasks: Task[];

  @OneToMany(() => ColumnEntity, (column) => column.kanban)
  columns: ColumnEntity[];

  @OneToMany(() => Row, (row) => row.kanban)
  rows: Row[];

  @OneToMany(() => Status, (status) => status.kanban)
  statuses: Status[];

  @OneToMany(() => KanbanSetting, (kanbanSetting) => kanbanSetting.kanban)
  kanbanSettings: KanbanSetting[];
}
