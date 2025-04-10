import { Injectable, NotFoundException } from '@nestjs/common';
import { Status } from './entities/status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNewStatusDto } from './dto/create-new-status.dto';
import { Kanban } from 'src/kanban/entities/kanban.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>,
  ) {}

  async getStatusForKanban(kanbanId: string) {
    const statuses = await this.statusRepository.find({
      where: { kanban: { id: +kanbanId } },
    });

    if (!statuses) {
      throw new NotFoundException('not-found-statuses-for-kanban');
    }

    return statuses;
  }

  async createNewStatus(data: CreateNewStatusDto) {
    const kanban = await this.kanbanRepository.findOne({
      where: { id: +data.kanbanId },
    });

    if (!kanban) {
      throw new NotFoundException('not-found-kanban');
    }

    const status = new Status();
    status.name = data.name;
    status.color = data.color;
    status.kanban = kanban;

    const createdStatus = await this.statusRepository.save(status);

    return createdStatus;
  }

  async deleteStatus(id: string): Promise<void> {
    const status = await this.statusRepository.findOne({
      where: { id: +id },
    });

    if (!status) {
      throw new NotFoundException('not-found-status');
    }

    await this.statusRepository.remove(status);
  }
}
