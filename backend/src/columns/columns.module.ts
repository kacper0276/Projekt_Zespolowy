import { Module } from '@nestjs/common';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnEntity } from './entities/column.entity';
import { Kanban } from 'src/kanban/entities/kanban.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity, Kanban])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
