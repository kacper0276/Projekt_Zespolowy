import { IsArray } from 'class-validator';

export class EditRowOrderDto {
  @IsArray()
  rows: string[];
}
