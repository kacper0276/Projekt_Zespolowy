import { Injectable } from '@nestjs/common';
import { ColumnEntity } from './entities/column.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kanban } from 'src/kanban/entities/kanban.entity';
import { CreateColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,

    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>,
  ) {}

  async addColumnToKanban(
    kanbanId: string,
    createColumnDto: CreateColumnDto,
  ): Promise<ColumnEntity> {
    const kanban = await this.kanbanRepository.findOne({
      where: { id: +kanbanId },
    });
    if (!kanban) {
      throw new Error('Kanban not found');
    }

    const column = this.columnRepository.create({
      ...createColumnDto,
      kanban,
    });

    return await this.columnRepository.save(column);
  }
}
