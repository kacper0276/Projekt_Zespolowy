import { IsDate, IsNotEmpty } from 'class-validator';

export class ChangeTaskDeadlineDto {
  @IsNotEmpty()
  @IsDate()
  deadline: Date;
}
