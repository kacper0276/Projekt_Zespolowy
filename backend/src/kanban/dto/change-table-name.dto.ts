import { IsNumber, IsString } from 'class-validator';

export class ChangeTableNameDto {
  @IsString()
  tableName: string;

  @IsNumber()
  id: number;
}
