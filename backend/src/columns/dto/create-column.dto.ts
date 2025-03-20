import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(['no-assigned', 'in-progress', 'done'], {
    message:
      'Status must be one of the following: no-assigned, in-progress, done',
  })
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
