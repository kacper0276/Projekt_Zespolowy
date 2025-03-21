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
      relations: ['columns'],
    });
    if (!kanban) {
      throw new Error('Kanban not found');
    }

    const maxOrder = kanban.columns.reduce((max, column) => {
      return column.order > max ? column.order : max;
    }, -1);

    const column = this.columnRepository.create({
      ...createColumnDto,
      kanban,
      order: maxOrder + 1,
    });

    return await this.columnRepository.save(column);
  }
}
