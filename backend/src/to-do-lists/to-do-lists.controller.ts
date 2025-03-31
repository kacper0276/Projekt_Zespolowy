import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ToDoListsService } from './to-do-lists.service';
import { CreateToDoListDto } from './dto/create-to-do-list.dto';
import { Response } from 'express';

@Controller('to-do-lists')
export class ToDoListsController {
  constructor(private readonly toDoListsService: ToDoListsService) {}

  @Post(':taskId')
  async create(
    @Param('taskId') taskId: string,
    @Body() createToDoListDto: CreateToDoListDto,
    @Res() response: Response,
  ) {
    try {
      const list = await this.toDoListsService.create(
        taskId,
        createToDoListDto,
      );

      response.status(HttpStatus.CREATED).send({
        message: 'todo-list-created',
        data: list,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: error.message,
        });
      } else {
        response.send(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
    return this.toDoListsService.create(taskId, createToDoListDto);
  }
}
