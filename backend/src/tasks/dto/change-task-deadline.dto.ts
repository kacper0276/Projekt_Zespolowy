import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeTaskDeadlineDto {
  @IsNotEmpty()
  @IsString()
  deadline: string;
}
