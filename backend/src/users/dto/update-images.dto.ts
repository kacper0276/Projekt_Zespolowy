import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateImagesDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;
}
