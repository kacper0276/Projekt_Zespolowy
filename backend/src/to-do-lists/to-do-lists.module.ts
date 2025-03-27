import { Module } from '@nestjs/common';
import { ToDoListsController } from './to-do-lists.controller';
import { ToDoListsService } from './to-do-lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToDoList } from './entities/to-do-list.entity';
import { ToDoItem } from './entities/to-do-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ToDoList, ToDoItem])],
  controllers: [ToDoListsController],
  providers: [ToDoListsService],
})
export class ToDoListsModule {}
