import { IsString, IsOptional, IsArray } from 'class-validator';
import { Task } from '../../tasks/entities/task.entity';
import { ToDoItemDto } from './to-do-item.dto';

export class CreateToDoListDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  items?: ToDoItemDto[];

  @IsOptional()
  task?: Task;
}
