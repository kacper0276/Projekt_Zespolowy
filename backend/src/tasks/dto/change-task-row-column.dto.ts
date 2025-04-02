import { IsNumber } from 'class-validator';

export class ChangeTaskRowColumnDto {
  @IsNumber()
  columnId: number;

  @IsNumber()
  rowId: number;
}
