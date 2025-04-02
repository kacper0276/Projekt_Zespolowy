import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'MaxTasks must be a positive number' })
  maxTasks?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Order must be a non-negative number' })
  order?: number;
}
