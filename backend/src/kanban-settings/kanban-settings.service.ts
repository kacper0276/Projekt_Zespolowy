import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KanbanSetting } from './entities/kanban-setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class KanbanSettingsService {
  constructor(
    @InjectRepository(KanbanSetting)
    private readonly kanbanSettingRepository: Repository<KanbanSetting>,
  ) {}

  async updateWipLimit(
    userId: string,
    kanbanId: string,
    newWipLimit: number,
  ): Promise<KanbanSetting> {
    let kanbanSetting = await this.kanbanSettingRepository.findOne({
      where: { user: { id: +userId }, kanban: { id: +kanbanId } },
    });

    if (!kanbanSetting) {
      kanbanSetting = this.kanbanSettingRepository.create({
        user: { id: +userId },
        kanban: { id: +kanbanId },
        wipLimit: newWipLimit,
      });
    } else {
      kanbanSetting.wipLimit = newWipLimit;
    }

    return this.kanbanSettingRepository.save(kanbanSetting);
  }
}
