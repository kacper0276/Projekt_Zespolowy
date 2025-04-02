import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  Matches,
} from 'class-validator';
import { ColumnEntity } from '../../columns/entities/column.entity';
import { Status } from 'src/status/entities/status.entity';
import { User } from 'src/users/entities/user.entity';
import { Row } from 'src/rows/entities/row.entity';

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
  rows: Row[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  statuses: Status[];

  @IsString()
  @IsOptional()
  @Matches(/^data:image\/(png|jpg|jpeg);base64,/, {
    message: 'Invalid Base64 format for background image',
  })
  backgroundImage: string;
}
