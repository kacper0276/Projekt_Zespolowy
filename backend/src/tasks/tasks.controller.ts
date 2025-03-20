import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateNewTaskDto } from './dto/create-new-task.dto';
import { Response } from 'express';
import { AssignUserToTaskDto } from './dto/assign-user-to-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('create-new')
  async createNewTask(
    @Body() data: CreateNewTaskDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.tasksService.createNewTask(data);

      response.status(HttpStatus.CREATED).send({
        message: 'task-created',
        data: res,
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
  }

  @Patch(':taskId/assign-users')
  async assignUsersToTask(
    @Param('taskId') taskId: string,
    @Body() assignUserToTaskDto: AssignUserToTaskDto,
    @Res() response: Response,
  ) {
    try {
      const updatedTask = await this.tasksService.assignUsersToTask(
        taskId,
        assignUserToTaskDto.users,
      );

      response.status(HttpStatus.OK).send({
        message: 'users-assigned',
        data: updatedTask,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({
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
