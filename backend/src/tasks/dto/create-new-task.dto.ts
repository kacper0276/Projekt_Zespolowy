import { IsNumber, IsString } from 'class-validator';

export class CreateNewTaskDto {
  @IsString()
  name: string;

  @IsNumber()
  kanbanId: number;

  @IsNumber()
  columnId: number;
}
