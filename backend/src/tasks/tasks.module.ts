import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Kanban } from 'src/kanban/entities/kanban.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Kanban, ColumnEntity, User])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
