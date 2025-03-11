import { Injectable } from '@nestjs/common';
import { ToDoList } from './entities/to-do-list.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ToDoListsService {
  constructor(
    @InjectRepository(ToDoList)
    private readonly toDoListRepository: Repository<ToDoList>,
  ) {}
}
