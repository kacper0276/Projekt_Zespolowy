import { IsString } from 'class-validator';

export class EditTaskDescriptionDto {
  @IsString()
  description: string;
}
