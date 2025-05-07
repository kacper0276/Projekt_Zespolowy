import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class RespondToInviteDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(['accept', 'reject'], {
    message: 'Action must be either "accept" or "reject"',
  })
  @IsNotEmpty()
  action: 'accept' | 'reject';
}
