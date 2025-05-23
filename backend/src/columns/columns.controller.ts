import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { Response } from 'express';
import { EditColumnOrderDto } from './dto/edit-column-order.dto';
import { EditWipLimitDto } from './dto/edit-wip-limit.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post(':kanbanId')
  async addColumnToKanban(
    @Param('kanbanId') kanbanId: string,
    @Body() createColumnDto: CreateColumnDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.columnsService.addColumnToKanban(
        kanbanId,
        createColumnDto,
      );
      response.status(HttpStatus.CREATED).send({
        message: 'column-added-to-kanban-successfully',
        data: res,
      });
    } catch (_error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Internal server error',
      });
    }
  }

  @Patch('edit-order/:kanbanId')
  async editColumnOrder(
    @Param('kanbanId') kanbanId: string,
    @Body() data: EditColumnOrderDto,
    @Res() response: Response,
  ) {
    try {
      await this.columnsService.updateColumnOrder(kanbanId, data.columns);

      response
        .status(HttpStatus.OK)
        .send({ message: 'column-order-updated-successfully' });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'a-server-error-occurred',
        });
      }
    }
  }

  @Patch('edit-wip-limit/:columnId')
  async editWipLimit(
    @Param('columnId') columnId: string,
    @Body() data: EditWipLimitDto,
    @Res() response: Response,
  ) {
    try {
      await this.columnsService.editWipLimit(columnId, data.newLimit);

      response
        .status(HttpStatus.OK)
        .send({ message: 'wip-limit-updated-successfully' });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'a-server-error-occurred',
        });
      }
    }
  }

  @Delete(':columnId')
  async deleteColumn(
    @Param('columnId') columnId: string,
    @Res() response: Response,
  ) {
    try {
      await this.columnsService.deleteColumn(+columnId);

      response
        .status(HttpStatus.OK)
        .send({ message: 'Column deleted successfully' });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'a-server-error-occurred',
        });
      }
    }
  }
}
