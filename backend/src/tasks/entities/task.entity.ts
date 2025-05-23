import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../entities/base.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ToDoList } from '../../to-do-lists/entities/to-do-list.entity';
import { ColumnEntity } from '../../columns/entities/column.entity';
import { Kanban } from '../../kanban/entities/kanban.entity';
import { Row } from '../../rows/entities/row.entity';
import { Status } from '../../status/entities/status.entity';
import { Comment } from '../../comments/entity/comment.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: '' })
  priority: string;

  @Column({ nullable: true, default: null })
  deadline: Date;

  @Column({ nullable: true })
  lastColumnName: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMovedToColumnAt: Date;

  @Column({ default: -1 })
  order: number;

  @ManyToOne(() => Status, (status) => status.tasks)
  status: Status;

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

  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments: Comment[];
}
