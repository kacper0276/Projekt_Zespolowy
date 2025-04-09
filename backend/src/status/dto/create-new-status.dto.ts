import { IsNotEmpty } from 'class-validator';

export class CreateNewStatusDto {
  @IsNotEmpty({ message: 'Nie można pominąć nazwy statusu' })
  name: string;

  @IsNotEmpty({ message: 'Nie można pominąć koloru statusu' })
  color: string;

  @IsNotEmpty({ message: 'Nie można pominąć kanbanu' })
  kanbanId: string;
}
