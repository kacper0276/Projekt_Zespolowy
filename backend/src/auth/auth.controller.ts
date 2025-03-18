import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { Response, Request } from 'express';

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

  @Get('me')
  async getMe(@Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.authService.getUserFromToken(
        req.headers.authorization,
      );
      res.status(HttpStatus.OK).send({
        message: 'user-retrieved',
        data: user,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }
}
