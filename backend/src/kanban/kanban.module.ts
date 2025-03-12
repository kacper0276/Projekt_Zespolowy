import { Module } from '@nestjs/common';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kanban } from './entities/kanban.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kanban, User]), UsersModule],
  controllers: [KanbanController],
  providers: [KanbanService],
})
export class KanbanModule {}
