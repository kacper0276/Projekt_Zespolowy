import { Controller } from '@nestjs/common';
import { KanbanSettingsService } from './kanban-settings.service';

@Controller('kanban-settings')
export class KanbanSettingsController {
  constructor(private readonly kanbanSettingsService: KanbanSettingsService) {}
}
