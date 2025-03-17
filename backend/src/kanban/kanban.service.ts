import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Kanban } from './entities/kanban.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { Status } from 'src/status/entities/status.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { CreateKanbanDto } from './dto/create-kanban.dto';

@Injectable()
export class KanbanService {
  constructor(
    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>,
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async assignUser(kanbanId: number, userId: number) {
    const kanban = await this.kanbanRepository.findOne({
      where: { id: kanbanId },
      relations: ['users'],
    });

    if (!kanban) {
      throw new Error('Kanban board not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (!kanban.users.some((u) => u.id === userId)) {
      kanban.users.push(user);
      await this.kanbanRepository.save(kanban);
    }

    return kanban;
  }

  async createKanban(createKanbanDto: CreateKanbanDto) {
    const users = await this.userRepository.findByIds(createKanbanDto.users);
    if (users.length !== createKanbanDto.users.length) {
      throw new Error('Jeden lub więcej użytkowników nie istnieje');
    }

    const tasks = await this.taskRepository.findByIds(createKanbanDto.tasks);
    const statuses = await Promise.all(
      createKanbanDto.statuses.map(async (status) => {
        if (typeof status === 'number') {
          return this.statusRepository.findOne({ where: { id: status } });
        } else {
          const newStatus = this.statusRepository.create(status);
          return this.statusRepository.save(newStatus);
        }
      }),
    );

    const kanban = this.kanbanRepository.create({
      tableName: createKanbanDto.tableName,
      users,
      tasks,
      statuses,
    });
    await this.kanbanRepository.save(kanban);

    const defaultColumns = ['ToDo', 'In Progress', 'Done'].map((name, index) =>
      this.columnRepository.create({ name, order: index, kanban }),
    );

    const customColumns = createKanbanDto.columns.map((col) =>
      this.columnRepository.create({ ...col, kanban }),
    );

    await this.columnRepository.save([...defaultColumns, ...customColumns]);

    return kanban;
  }

  async getKanbansByUserEmail(email: string): Promise<Kanban[]> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['kanbans'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user.kanbans;
  }
}
