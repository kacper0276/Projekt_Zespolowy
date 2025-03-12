import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Kanban } from './entities/kanban.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class KanbanService {
  constructor(
    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>,
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
}
