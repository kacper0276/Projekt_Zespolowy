import { IsArray } from 'class-validator';

export class EditColumnOrderDto {
  @IsArray()
  columns: string[];
}
