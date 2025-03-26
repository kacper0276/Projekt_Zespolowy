import { Injectable, NotFoundException } from '@nestjs/common';
import { ColumnEntity } from './entities/column.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
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

  async updateColumnOrder(
    kanbanId: string,
    columnNames: string[],
  ): Promise<void> {
    const kanban = await this.kanbanRepository.findOne({
      where: { id: +kanbanId },
      relations: ['columns'],
    });

    if (!kanban) {
      throw new NotFoundException('Kanban not found');
    }

    const columnsToUpdate = kanban.columns.filter((column) =>
      columnNames.includes(column.name),
    );

    if (columnsToUpdate.length !== columnNames.length) {
      throw new NotFoundException('Some columns not found');
    }

    columnsToUpdate.sort((a, b) => {
      return columnNames.indexOf(a.name) - columnNames.indexOf(b.name);
    });

    columnsToUpdate.forEach((column, index) => {
      column.order = index;
    });

    await this.columnRepository.save(columnsToUpdate);
  }

  async editWipLimit(columnId: string, limit: number): Promise<void> {
    const column = await this.columnRepository.findOne({
      where: { id: +columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    column.maxTasks = limit;
    await this.columnRepository.save(column);
  }

  async deleteColumn(columnId: number): Promise<void> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
      relations: ['tasks'],
    });

    console.log(column);

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const previousColumn = await this.columnRepository.findOne({
      where: {
        order: LessThan(column.order),
      },
      relations: ['tasks'],
      order: {
        order: 'DESC',
      },
    });

    if (previousColumn) {
      previousColumn.tasks = [...previousColumn.tasks, ...column.tasks];

      await this.columnRepository.save(previousColumn);
    }

    await this.columnRepository.remove(column);
  }
}
