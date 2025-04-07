import { Module } from '@nestjs/common';
import { KanbanSettingsController } from './kanban-settings.controller';
import { KanbanSettingsService } from './kanban-settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanSetting } from './entities/kanban-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanSetting])],
  controllers: [KanbanSettingsController],
  providers: [KanbanSettingsService],
})
export class KanbanSettingsModule {}
