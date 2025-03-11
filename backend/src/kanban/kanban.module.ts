import { Module } from '@nestjs/common';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kanban } from './entities/kanban.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kanban])],
  controllers: [KanbanController],
  providers: [KanbanService],
})
export class KanbanModule {}
