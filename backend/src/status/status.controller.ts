import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { StatusService } from './status.service';
import { CreateNewStatusDto } from './dto/create-new-status.dto';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get(':kanbanId/get-for-kanban')
  async getStatusForKanban(
    @Param('kanbanId') kanbanId: string,
    @Res() response: Response,
  ) {
    try {
      const res = await this.statusService.getStatusForKanban(kanbanId);

      response.status(HttpStatus.OK).send({
        message: 'status-found',
        data: res,
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

  @Post('create')
  async createNewStatus(
    @Body() data: CreateNewStatusDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.statusService.createNewStatus(data);

      response.status(HttpStatus.CREATED).send({
        message: 'status-created',
        data: res,
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

  @Delete(':statusId/delete')
  async deleteStatus(
    @Param('statusId') statusId: string,
    @Res() response: Response,
  ) {
    try {
      await this.statusService.deleteStatus(statusId);

      response.status(HttpStatus.OK).send({
        message: 'status-deleted',
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
