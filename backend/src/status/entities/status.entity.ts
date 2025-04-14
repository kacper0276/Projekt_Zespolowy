import { Task } from '../../tasks/entities/task.entity';
import { BaseEntity } from '../../entities/base.entity';
import { Kanban } from '../../kanban/entities/kanban.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('statuses')
export class Status extends BaseEntity {
  @Column()
  name: string;

  @Column()
  color: string;

  @ManyToOne(() => Kanban, (kanban) => kanban.statuses)
  kanban: Kanban;

  @OneToMany(() => Task, (task) => task.status)
  tasks: Task[];
}
