import { BaseEntity } from '../../entities/base.entity';
import { Kanban } from '../../kanban/entities/kanban.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('statuses')
export class Status extends BaseEntity {
  @Column()
  name: string;

  @Column()
  color: string;

  @ManyToOne(() => Kanban, (kanban) => kanban.statuses)
  kanban: Kanban;
}
