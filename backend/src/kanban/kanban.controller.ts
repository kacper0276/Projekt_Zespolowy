import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AssignUserDto } from './dto/assign-user.dto';
import { KanbanService } from './kanban.service';
import { CreateKanbanDto } from './dto/create-kanban.dto';
import { Response } from 'express';

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

  @Post()
  async createKanban(
    @Body() createKanbanDto: CreateKanbanDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.kanbanService.createKanban(createKanbanDto);
      response.status(HttpStatus.CREATED).send({
        message: 'kanban-board-created',
        data: res,
      });
    } catch (_error) {
      response.send(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Get('user')
  async getKanbanByUserEmail(
    @Query('email') email: string,
    @Res() response: Response,
  ) {
    try {
      const res = await this.kanbanService.getKanbansByUserEmail(email);
      response.status(HttpStatus.OK).send({
        message: 'kanban-board-retrieved',
        data: res,
      });
    } catch (_error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Get('board/:id')
  async getKanbanById(@Param('id') id: number, @Res() response: Response) {
    try {
      const res = await this.kanbanService.getKanbanById(id);
      response.status(HttpStatus.OK).send({
        message: 'kanban-board',
        data: res,
      });
    } catch (_error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }
}
