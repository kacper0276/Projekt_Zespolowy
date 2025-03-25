import { IsArray, ValidateNested } from 'class-validator';

export class ChangeTasksOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  tasksIds: number[];
}
