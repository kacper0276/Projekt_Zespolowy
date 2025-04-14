import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Row } from './entities/row.entity';
import { LessThan, Repository } from 'typeorm';
import { Kanban } from '../kanban/entities/kanban.entity';
import { CreateRowDto } from './dto/create-row.dto';

@Injectable()
export class RowsService {
  constructor(
    @InjectRepository(Row) private readonly rowRepository: Repository<Row>,
    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>,
  ) {}

  async addRowToKanban(
    kanbanId: string,
    createRowDto: CreateRowDto,
  ): Promise<Row> {
    const kanban = await this.kanbanRepository.findOne({
      where: { id: +kanbanId },
      relations: ['rows'],
    });
    if (!kanban) {
      throw new NotFoundException('Kanban not found');
    }

    const maxOrder = kanban.rows.reduce((max, row) => {
      return row.order > max ? row.order : max;
    }, -1);

    const row = this.rowRepository.create({
      ...createRowDto,
      kanban,
      order: maxOrder + 1,
    });

    return await this.rowRepository.save(row);
  }

  async updateRowOrder(kanbanId: string, rowNames: string[]): Promise<void> {
    const kanban = await this.kanbanRepository.findOne({
      where: { id: +kanbanId },
      relations: ['rows'],
    });

    if (!kanban) {
      throw new NotFoundException('Kanban not found');
    }

    const rowsToUpdate = kanban.rows.filter((row) =>
      rowNames.includes(row.name),
    );

    if (rowsToUpdate.length !== rowNames.length) {
      throw new NotFoundException('Some rows not found');
    }

    rowsToUpdate.sort((a, b) => {
      return rowNames.indexOf(a.name) - rowNames.indexOf(b.name);
    });

    rowsToUpdate.forEach((row, index) => {
      row.order = index;
    });

    await this.rowRepository.save(rowsToUpdate);
  }

  async editWitLimit(rowId: string, limit: number): Promise<void> {
    const row = await this.rowRepository.findOne({ where: { id: +rowId } });
    if (!row) {
      throw new NotFoundException('Row not found');
    }

    row.maxTasks = limit;
    await this.rowRepository.save(row);
  }

  async deleteRow(rowId: string): Promise<void> {
    const row = await this.rowRepository.findOne({
      where: { id: +rowId },
      relations: ['tasks'],
    });

    if (!row) {
      throw new NotFoundException('Row not found');
    }

    const previousRow = await this.rowRepository.findOne({
      where: {
        order: LessThan(row.order),
      },
      relations: ['tasks'],
      order: {
        order: 'DESC',
      },
    });

    if (previousRow) {
      previousRow.tasks = [...previousRow.tasks, ...row.tasks];

      await this.rowRepository.save(previousRow);
    }

    await this.rowRepository.remove(row);
  }
}
