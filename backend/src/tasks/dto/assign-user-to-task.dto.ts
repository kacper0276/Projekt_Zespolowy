import { IsArray, ValidateNested } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class AssignUserToTaskDto {
  @IsArray()
  @ValidateNested({ each: true })
  users: User[];
}
