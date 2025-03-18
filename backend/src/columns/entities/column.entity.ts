import { BaseEntity } from '../../entities/base.entity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Kanban } from '../../kanban/entities/kanban.entity';

@Entity('columns')
export class ColumnEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: 'no-assigned' })
  status: string;

  @OneToMany(() => Task, (task) => task.column)
  tasks: Task[];

  @Column({ default: 0 })
  maxTasks: number;

  @Column({ default: -1 })
  order: number;

  @ManyToOne(() => Kanban, (kanban) => kanban.columns)
  kanban: Kanban;
}
