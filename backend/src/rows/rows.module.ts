import { Module } from '@nestjs/common';
import { RowsController } from './rows.controller';
import { RowsService } from './rows.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Row } from './entities/row.entity';
import { Kanban } from 'src/kanban/entities/kanban.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Row, Kanban])],
  controllers: [RowsController],
  providers: [RowsService],
})
export class RowsModule {}
