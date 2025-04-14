import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNewTaskDto } from './dto/create-new-task.dto';
import { Kanban } from '../kanban/entities/kanban.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { User } from '../users/entities/user.entity';
import { EditTaskDescriptionDto } from './dto/edit-task-description.dto';
import { ChangeColumnDto } from './dto/change-column.dto';
import { ChangeTasksOrderDto } from './dto/change-tasks-order.dto';
import { Row } from '../rows/entities/row.entity';
import { ChangeTaskRowColumnDto } from './dto/change-task-row-column.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Row)
    private readonly rowRepository: Repository<Row>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createNewTask(data: CreateNewTaskDto) {
    try {
      if (!data.name.trim()) {
        throw new BadRequestException('Nazwa nie może być pusta');
      }

      const kanban = await this.kanbanRepository.findOne({
        where: { id: data.kanbanId },
        relations: ['tasks'],
      });
      const column = await this.columnRepository.findOne({
        where: { id: data.columnId },
        relations: ['tasks'],
      });
      const row = await this.rowRepository.findOne({
        where: { id: data.rowId },
        relations: ['tasks'],
      });

      if (!kanban) {
        throw new NotFoundException('Tablica Kanban nie została znaleziona');
      }

      const task = new Task();
      task.name = data.name;
      task.description = data.description;
      // task.status = data.status;
      task.priority = data.priority;
      task.column = column;
      task.row = row;

      const savedTask = await this.taskRepository.save(task);

      kanban.tasks.push(savedTask);
      await this.kanbanRepository.save(kanban);

      return savedTask;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async assignUsersToTask(taskId: string, users: User[]) {
    const task = await this.taskRepository.findOne({
      where: { id: +taskId },
      relations: ['users'],
    });

    if (!task) {
      throw new NotFoundException('task-not-found');
    }

    if (!users || users.length === 0) {
      throw new NotFoundException('no-users-provided');
    }

    task.users = [...users];

    const updatedTask = await this.taskRepository.save(task);

    return updatedTask;
  }

  async assignUserToTask(taskId: string, user: User) {
    const task = await this.taskRepository.findOne({
      where: { id: +taskId },
      relations: ['users'],
    });

    if (!task) {
      throw new NotFoundException('task-not-found');
    }

    if (!user) {
      throw new NotFoundException('no-user-provided');
    }

    task.users = [...task.users, user];

    const updatedTask = await this.taskRepository.save(task);

    return updatedTask;
  }

  async editTaskDescription(taskId: string, data: EditTaskDescriptionDto) {
    const task = await this.taskRepository.findOne({
      where: { id: +taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.description = data.description;

    const updatedTask = await this.taskRepository.save(task);

    return updatedTask;
  }

  async changeTaskColumn(taskId: string, data: ChangeColumnDto) {
    const task = await this.taskRepository.findOne({
      where: { id: +taskId },
      relations: ['column'],
    });

    const column = await this.columnRepository.findOne({
      where: { id: data.columnId },
    });

    task.column = column;

    return await this.taskRepository.save(task);
  }

  async changeTaskRowColumn(taskId: string, data: ChangeTaskRowColumnDto) {
    const task = await this.taskRepository.findOne({
      where: { id: +taskId },
      relations: ['row', 'column'],
    });

    const row = await this.rowRepository.findOne({
      where: { id: data.rowId },
    });

    const column = await this.columnRepository.findOne({
      where: { id: data.columnId },
    });

    task.row = row;
    task.column = column;

    return await this.taskRepository.save(task);
  }

  async changeTasksOrder(data: ChangeTasksOrderDto) {
    for (const taskOrder in data.tasksIds) {
      const taskEntity = await this.taskRepository.findOne({
        where: { id: data.tasksIds[taskOrder] },
      });

      taskEntity.order = +taskOrder;

      await this.taskRepository.save(taskEntity);
    }

    return 'Tasks order changed successfully';
  }

  async deleteTask(taskId: string) {
    try {
      const task = await this.taskRepository.findOne({
        where: { id: +taskId },
        relations: ['column', 'kanbans', 'kanbans.tasks'],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (task.kanbans && task.kanbans.length > 0) {
        for (const kanban of task.kanbans) {
          kanban.tasks = kanban.tasks.filter((t) => t.id !== task.id);
          await this.kanbanRepository.save(kanban);
        }
      }

      await this.kanbanRepository
        .createQueryBuilder()
        .delete()
        .from('kanbans_tasks_tasks')
        .where('tasksId = :taskId', { taskId: task.id })
        .execute();

      await this.taskRepository.delete(taskId);

      return { message: 'Task deleted successfully' };
    } catch (error) {
      console.log(error);
    }
  }

  async changeTaskStatus(taskId: string, data: ChangeTaskStatusDto) {
    const task = await this.taskRepository.findOne({
      where: { id: +taskId },
      relations: ['status'],
    });

    task.status = data.status;

    const updatedTask = await this.taskRepository.save(task);
    return updatedTask;
  }
}
