import {
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  groupName?: string;

  @IsBoolean()
  @IsNotEmpty()
  isGroupChat: boolean;
}
