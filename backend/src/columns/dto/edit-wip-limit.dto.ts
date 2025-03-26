import { IsNumber } from 'class-validator';

export class EditWipLimitDto {
  @IsNumber()
  newLimit: number;
}
