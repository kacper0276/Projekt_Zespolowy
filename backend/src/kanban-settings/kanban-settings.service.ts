import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KanbanSetting } from './entities/kanban-setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class KanbanSettingsService {
  constructor(
    @InjectRepository(KanbanSetting)
    private readonly kanbanSettingRepository: Repository<KanbanSetting>,
  ) {}
}
