import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ColumnEntity } from '../../columns/entities/column.entity';
import { Status } from 'src/status/entities/status.entity';

export class CreateKanbanDto {
  @IsString()
  tableName: string;

  @IsArray()
  @IsOptional()
  users: number[];

  @IsArray()
  @IsOptional()
  tasks: number[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  columns: ColumnEntity[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  statuses: Status[];
}
