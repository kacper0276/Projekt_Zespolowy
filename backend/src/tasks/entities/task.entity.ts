import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../entities/base.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { ToDoList } from '../../to-do-lists/entities/to-do-list.entity';
import { ColumnEntity } from '../../columns/entities/column.entity';
import { Kanban } from 'src/kanban/entities/kanban.entity';
import { Row } from 'src/rows/entities/row.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: '' })
  status: string;

  @Column({ default: '' })
  priority: string;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ default: -1 })
  order: number;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];

  @ManyToOne(() => ColumnEntity, (column) => column.tasks)
  column: ColumnEntity;

  @ManyToOne(() => Row, (row) => row.tasks)
  row: Row;

  @ManyToMany(() => ToDoList, (todoList) => todoList.task, { cascade: true })
  @JoinTable()
  toDoLists: ToDoList[];

  @ManyToMany(() => Kanban, (kanban) => kanban.tasks)
  kanbans: Kanban[];
}
