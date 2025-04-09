import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';
import { Kanban } from 'src/kanban/entities/kanban.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Status, Kanban])],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
