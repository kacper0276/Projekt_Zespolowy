import { Module } from '@nestjs/common';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kanban } from './entities/kanban.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { Status } from '../status/entities/status.entity';
import { Task } from '../tasks/entities/task.entity';
import { ColumnEntity } from '../columns/entities/column.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kanban, User, Status, Task, ColumnEntity]),
    UsersModule,
  ],
  controllers: [KanbanController],
  providers: [KanbanService],
})
export class KanbanModule {}
