import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { registerData } from './dto/register-data.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  async getAllUsers(@Res() response: Response) {
    const res = await this.usersService.getAllUsers();

    response.status(HttpStatus.OK).send({
      message: 'get-all-users',
      data: res,
    });
  }

  @Post('register')
  async registerUser(
    @Body() registerData: registerData,
    @Res() response: Response,
  ) {
    try {
      const user = await this.usersService.registerUser(registerData);
      response.status(HttpStatus.CREATED).send({
        message: 'user-registered',
        data: user,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: error.message,
        });
      } else {
        response.send(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
  }
}
