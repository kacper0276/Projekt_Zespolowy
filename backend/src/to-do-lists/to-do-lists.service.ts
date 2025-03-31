import { Injectable } from '@nestjs/common';
import { ToDoList } from './entities/to-do-list.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/tasks/entities/task.entity';
import { CreateToDoListDto } from './dto/create-to-do-list.dto';

@Injectable()
export class ToDoListsService {
  constructor(
    @InjectRepository(ToDoList)
    private readonly toDoListRepository: Repository<ToDoList>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(
    taskId: string,
    createToDoListDto: CreateToDoListDto,
  ): Promise<ToDoList> {
    const { name, items, task } = createToDoListDto;
    const taskDb = await this.taskRepository.findOne({
      where: { id: +taskId },
    });

    const toDoList = this.toDoListRepository.create({
      name,
      items,
      task: task ? task : taskDb,
    });

    console.log(toDoList);

    return this.toDoListRepository.save(toDoList);
  }
}
