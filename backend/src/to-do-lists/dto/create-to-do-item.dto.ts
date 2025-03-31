import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateToDoItemDto {
  @IsString()
  name: string;

  @IsBoolean()
  isDone: boolean;

  @IsOptional()
  @IsNumber()
  parentItemId?: number;
}
