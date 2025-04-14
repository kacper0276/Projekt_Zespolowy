import { BaseEntity } from '../../entities/base.entity';
import { Kanban } from '../../kanban/entities/kanban.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('kanban_settings')
export class KanbanSetting extends BaseEntity {
  @ManyToOne(() => Kanban, (kanban) => kanban.kanbanSettings)
  kanban: Kanban;

  @ManyToOne(() => User, (user) => user.kanbanSettings)
  user: User;

  @Column({ type: 'int', default: 0 })
  wipLimit: number;
}
