import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateNewTaskDto } from './dto/create-new-task.dto';
import { Response } from 'express';
import { AssignUsersToTaskDto } from './dto/assign-users-to-task.dto';
import { EditTaskDescriptionDto } from './dto/edit-task-description.dto';
import { ChangeColumnDto } from './dto/change-column.dto';
import { ChangeTasksOrderDto } from './dto/change-tasks-order.dto';
import { ChangeTaskRowColumnDto } from './dto/change-task-row-column.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';
import { AssignUserToTaskDto } from './dto/assign-user-to-task.dto';
import { ChangeTaskDeadlineDto } from './dto/change-task-deadline.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':taskId')
  async getTaskById(
    @Param('taskId') taskId: string,
    @Res() response: Response,
  ) {
    try {
      const task = await this.tasksService.getTaskById(taskId);
      response.status(HttpStatus.OK).send({
        message: 'task-found',
        data: task,
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
    @Body() assignUserToTaskDto: AssignUsersToTaskDto,
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

  @Patch(':taskId/assign-user')
  async assignUserToTask(
    @Param('taskId') taskId: string,
    @Body() data: AssignUserToTaskDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.tasksService.assignUserToTask(taskId, data.user);

      response.status(HttpStatus.OK).send({
        message: 'user-assigned',
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

  @Patch(':taskId/edit-description')
  async editTaskDescription(
    @Param('taskId') taskId: string,
    @Body() data: EditTaskDescriptionDto,
    @Res() response: Response,
  ) {
    try {
      const result = await this.tasksService.editTaskDescription(taskId, data);

      response.status(HttpStatus.OK).send({
        message: 'changed-task-description',
        data: result,
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

  @Patch(':taskId/change-column')
  async changeTaskColumn(
    @Param('taskId') taskId: string,
    @Body() data: ChangeColumnDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.tasksService.changeTaskColumn(taskId, data);

      response.status(HttpStatus.OK).send({
        message: 'changed-task-column',
        data: res,
      });
    } catch (error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Patch(':taskId/change-row-column')
  async changeTaskRowColumn(
    @Param('taskId') taskId: string,
    @Body() data: ChangeTaskRowColumnDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.tasksService.changeTaskRowColumn(taskId, data);

      response.status(HttpStatus.OK).send({
        message: 'changed-task-row-column',
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

  @Patch(':taskId/change-status')
  async changeTaskStatus(
    @Param('taskId') taskId: string,
    @Body() data: ChangeTaskStatusDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.tasksService.changeTaskStatus(taskId, data);

      response.status(HttpStatus.OK).send({
        message: 'changed-task-status',
        data: res,
      });
    } catch (error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Patch(':taskId/change-deadline')
  async changeTaskDeadline(
    @Param('taskId') taskId: string,
    @Body() data: ChangeTaskDeadlineDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.tasksService.changeTaskDeadline(
        taskId,
        data.deadline,
      );

      response.status(HttpStatus.OK).send({
        message: 'changed-task-deadline',
        data: res,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: error.message,
        });
      } else if (error instanceof TypeError) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: 'invalid-date-format',
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
  }

  @Patch('change-order')
  async changeTasksOrder(
    @Body() data: ChangeTasksOrderDto,
    @Res() response: Response,
  ) {
    try {
      await this.tasksService.changeTasksOrder(data);

      response.status(HttpStatus.OK).send({
        message: 'changed-tasks-order',
      });
    } catch (error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Delete(':taskId')
  async deleteTask(@Param('taskId') taskId: string, @Res() response: Response) {
    try {
      const result = await this.tasksService.deleteTask(taskId);
      response.status(HttpStatus.OK).send(result);
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
