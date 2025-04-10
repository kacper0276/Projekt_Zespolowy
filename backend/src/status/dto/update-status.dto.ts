import { IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
