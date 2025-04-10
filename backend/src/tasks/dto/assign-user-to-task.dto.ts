import { IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class AssignUserToTaskDto {
  @IsNotEmpty()
  user: User;
}
