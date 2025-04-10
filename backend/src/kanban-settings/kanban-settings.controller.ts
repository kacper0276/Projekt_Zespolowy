import {
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import { KanbanSettingsService } from './kanban-settings.service';
import e, { Response } from 'express';
import { EditWipLimitDto } from './dto/edit-wip-limit.dto';

@Controller('kanban-settings')
export class KanbanSettingsController {
  constructor(private readonly kanbanSettingsService: KanbanSettingsService) {}

  @Patch(':userId/:kanbanId/edit-wip-limit')
  async updateWipLimit(
    @Param('userId') userId: string,
    @Param('kanbanId') kanbanId: string,
    @Body() data: EditWipLimitDto,
    @Res() response: Response,
  ) {
    const { newWipLimit } = data;
    try {
      const kanbanSetting = await this.kanbanSettingsService.updateWipLimit(
        userId,
        kanbanId,
        newWipLimit,
      );

      response.status(HttpStatus.OK).send({
        message: 'kanban-settings-updated',
        data: kanbanSetting,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
  }
}
