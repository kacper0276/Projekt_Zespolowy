import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ColumnEntity } from '../../columns/entities/column.entity';
import { Status } from 'src/status/entities/status.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateKanbanDto {
  @IsString()
  tableName: string;

  @IsArray()
  @IsOptional()
  users: User[];

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
