import { IsNotEmpty } from 'class-validator';
import { Status } from 'src/status/entities/status.entity';

export class ChangeTaskStatusDto {
  @IsNotEmpty({ message: 'Nie można pominąć statusu' })
  status: Status;
}
