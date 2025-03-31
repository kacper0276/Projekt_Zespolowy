import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ToDoItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  isDone: boolean;

  @IsOptional()
  subItems?: ToDoItemDto[];

  @IsOptional()
  parentItem?: ToDoItemDto;
}
