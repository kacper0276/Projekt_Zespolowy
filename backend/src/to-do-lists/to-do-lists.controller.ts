import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ToDoListsService } from './to-do-lists.service';
import { CreateToDoListDto } from './dto/create-to-do-list.dto';
import { Response } from 'express';
import { CreateToDoItemDto } from './dto/create-to-do-item.dto';

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

  @Post(':listId/items')
  async addToDoItem(
    @Param('listId') listId: string,
    @Body() createToDoItemDto: CreateToDoItemDto,
    @Res() response: Response,
  ) {
    try {
      const newItem = await this.toDoListsService.addToDoItem(
        listId,
        createToDoItemDto,
      );
      response.status(HttpStatus.OK).send({
        message: 'todo-item-added',
        data: newItem,
      });
    } catch (error) {
      response.send(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Get('task/:taskId')
  async getListsByTaskId(
    @Param('taskId') taskId: string,
    @Res() response: Response,
  ) {
    try {
      const lists = await this.toDoListsService.getListsByTaskId(taskId);

      response.status(HttpStatus.OK).send({
        message: 'todo-lists-found',
        data: lists,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: error.message,
        });
      } else if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.send(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
  }
}
