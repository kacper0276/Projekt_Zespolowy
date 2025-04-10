import { IsNotEmpty, IsNumber } from 'class-validator';

export class EditWipLimitDto {
  @IsNumber()
  @IsNotEmpty()
  newWipLimit: number;
}
