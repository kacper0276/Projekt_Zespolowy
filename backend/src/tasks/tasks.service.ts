import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNewTaskDto } from './dto/create-new-task.dto';
import { Kanban } from 'src/kanban/entities/kanban.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
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

      if (!kanban) {
        throw new NotFoundException('Tablica Kanban nie została znaleziona');
      }

      const task = new Task();
      task.name = data.name;
      task.description = data.description;
      task.status = data.status;
      task.priority = data.priority;
      task.column = column;

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
      throw new NotFoundException('Task not found');
    }

    if (!users || users.length === 0) {
      throw new NotFoundException('No users provided');
    }

    task.users = [...task.users, ...users];

    const updatedTask = await this.taskRepository.save(task);

    return updatedTask;
  }
}
