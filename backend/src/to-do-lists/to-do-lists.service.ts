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

  async create(createToDoListDto: CreateToDoListDto): Promise<ToDoList> {
    const { name, items, task } = createToDoListDto;

    const toDoList = this.toDoListRepository.create({
      name,
      items,
      task,
    });

    return await this.toDoListRepository.save(toDoList);
  }
}
