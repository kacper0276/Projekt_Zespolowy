import { BaseEntity } from 'src/entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ToDoList } from './to-do-list.entity';

@Entity('to_do_items')
export class ToDoItem extends BaseEntity {
  @Column({ nullable: true })
  name?: string;

  @Column({ default: false })
  isDone: boolean;

  @ManyToOne(() => ToDoList, (list) => list.items, { onDelete: 'CASCADE' })
  toDoList: ToDoList;

  @OneToMany(() => ToDoItem, (item) => item.parentItem, { cascade: true })
  subItems: ToDoItem[];

  @ManyToOne(() => ToDoItem, (item) => item.subItems, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentItem?: ToDoItem;
}
