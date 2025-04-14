import { Injectable, NotFoundException } from '@nestjs/common';
import { ToDoList } from './entities/to-do-list.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { CreateToDoListDto } from './dto/create-to-do-list.dto';
import { CreateToDoItemDto } from './dto/create-to-do-item.dto';
import { ToDoItem } from './entities/to-do-item.entity';

@Injectable()
export class ToDoListsService {
  constructor(
    @InjectRepository(ToDoList)
    private readonly toDoListRepository: Repository<ToDoList>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(ToDoItem)
    private readonly toDoItemRepository: Repository<ToDoItem>,
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

    return this.toDoListRepository.save(toDoList);
  }

  async addToDoItem(
    listId: string,
    createToDoItemDto: CreateToDoItemDto,
  ): Promise<ToDoItem> {
    const toDoList = await this.toDoListRepository.findOne({
      where: { id: +listId },
    });

    if (!toDoList) {
      throw new NotFoundException('To-Do List not found');
    }

    const newItem = this.toDoItemRepository.create({
      ...createToDoItemDto,
      toDoList,
    });

    return this.toDoItemRepository.save(newItem);
  }

  async getListsByTaskId(taskId: string) {
    const toDoLists = await this.toDoListRepository.find({
      where: { task: { id: +taskId } },
      relations: ['task', 'items'],
    });

    return toDoLists;
  }
}
