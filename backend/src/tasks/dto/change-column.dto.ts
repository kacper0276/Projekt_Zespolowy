import { IsNumber } from 'class-validator';

export class ChangeColumnDto {
  @IsNumber()
  columnId: number;
}
