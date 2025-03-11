import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res() response: Response,
  ) {
    const user = await this.usersService.loginUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const data = await this.authService.login(user);

    response.status(HttpStatus.OK).send({
      message: 'successfully-logged-in',
      data,
    });
  }

  @Post('refresh')
  async refreshToken(@Body() refreshDto: { refreshToken: string }) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }
}
