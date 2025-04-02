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
import { RowsService } from './rows.service';
import { Response } from 'express';
import { CreateRowDto } from './dto/create-row.dto';
import { EditRowOrderDto } from './dto/edit-row-order.dto';
import { EditWipLimitDto } from './dto/edit-wip.limit.dto';

@Controller('rows')
export class RowsController {
  constructor(private readonly rowsService: RowsService) {}

  @Post(':kanbanId')
  async addRowToKanban(
    @Param('kanbanId') kanbanId: string,
    @Body() createRowDto: CreateRowDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.rowsService.addRowToKanban(kanbanId, createRowDto);
      response.status(HttpStatus.CREATED).send({
        message: 'row-added-to-kanban-successfully',
        data: res,
      });
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

  @Patch('edit-order/:kanbanId')
  async editRowOrder(
    @Param('kanbanId') kanbanId: string,
    @Body() data: EditRowOrderDto,
    @Res() response: Response,
  ) {
    try {
      await this.rowsService.updateRowOrder(kanbanId, data.rows);

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

  @Patch('edit-wip-limit/:rowId')
  async editWipLimit(
    @Param('rowId') rowId: string,
    @Body() data: EditWipLimitDto,
    @Res() response: Response,
  ) {
    try {
      await this.rowsService.editWitLimit(rowId, data.newLimit);

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

  @Delete(':rowId')
  async deleteRow(@Param('rowId') rowId: string, @Res() response: Response) {
    try {
      await this.rowsService.deleteRow(rowId);

      response
        .status(HttpStatus.OK)
        .send({ message: 'row-deleted-successfully' });
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
