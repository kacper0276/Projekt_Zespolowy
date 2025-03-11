import { BaseEntity } from '../../entities/base.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity('to_do_lists')
export class ToDoList extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Task, (task) => task.toDoList)
  tasks: Task[];
}
