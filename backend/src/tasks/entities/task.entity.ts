import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../entities/base.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { ToDoList } from '../../to-do-lists/entities/to-do-list.entity';
import { ColumnEntity } from '../../columns/entities/column.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  status: string;

  @Column()
  priority: string;

  @Column()
  deadline: Date;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];

  @ManyToOne(() => ColumnEntity, (column) => column.tasks)
  column: ColumnEntity;

  @ManyToOne(() => ToDoList, (todoList) => todoList.tasks)
  toDoList: ToDoList;
}
