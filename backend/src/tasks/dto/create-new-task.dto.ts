import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateNewTaskDto {
  @IsString()
  name: string;

  @IsNumber()
  kanbanId: number;

  @IsNumber()
  columnId: number;

  // TODO: Odkomentować rowId, ale to jak Tomek resztę zrobi
  // @IsNumber()
  // rowId: number;

  @IsString()
  status: string;

  @IsString()
  priority: string;

  @IsString()
  description: string;

  @IsDate()
  deadline: Date;
}
