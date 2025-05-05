import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { InviteStatus } from '../../enums/invite-status.enum';

export class CreateTeamInviteDto {
  @IsString()
  teamId: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(InviteStatus, {
    message: 'Status must be one of the valid InviteStatus values',
  })
  status?: InviteStatus;
}
