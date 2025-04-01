import { Module } from '@nestjs/common';
import { RowsController } from './rows.controller';
import { RowsService } from './rows.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Row } from './entities/row.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Row])],
  controllers: [RowsController],
  providers: [RowsService],
})
export class RowsModule {}
