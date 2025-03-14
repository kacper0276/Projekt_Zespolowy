import { Module } from '@nestjs/common';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnEntity } from './entities/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
