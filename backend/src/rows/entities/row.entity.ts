import { BaseEntity } from '../../entities/base.entity';
import { Kanban } from '../../kanban/entities/kanban.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('rows')
export class Row extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: 'no-assigned' })
  status: string;

  @OneToMany(() => Task, (task) => task.row)
  tasks: Task[];

  @Column({ default: 0 })
  maxTasks: number;

  @Column({ default: -1 })
  order: number;

  @ManyToOne(() => Kanban, (kanban) => kanban.rows)
  kanban: Kanban;
}
