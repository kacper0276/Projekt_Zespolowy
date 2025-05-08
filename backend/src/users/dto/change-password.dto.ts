import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
