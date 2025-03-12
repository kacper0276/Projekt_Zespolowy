import { Body, Controller, Param, Patch } from '@nestjs/common';
import { AssignUserDto } from './dto/assign-user.dto';
import { KanbanService } from './kanban.service';

@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Patch(':kanbanId/assign-user')
  async assignUserToKanban(
    @Param('kanbanId') kanbanId: number,
    @Body() assignUserDto: AssignUserDto,
  ) {
    return this.kanbanService.assignUser(kanbanId, assignUserDto.userId);
  }
}
