import { BaseEntity } from '../../entities/base.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { ToDoItem } from './to-do-item.entity';

@Entity('to_do_lists')
export class ToDoList extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => ToDoItem, (item) => item.toDoList, { cascade: true })
  items: ToDoItem[];

  @ManyToOne(() => Task, (task) => task.toDoLists, { onDelete: 'CASCADE' })
  task: Task;
}
