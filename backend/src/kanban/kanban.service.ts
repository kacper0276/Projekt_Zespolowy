import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Kanban } from './entities/kanban.entity';
import { Repository } from 'typeorm';

@Injectable()
export class KanbanService {
  constructor(
    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>,
  ) {}
}
