import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { registerData } from './dto/register-data.dto';
import { loginData } from './dto/login-data.dto';

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

  @Post('login')
  async loginUser(@Body() loginData: loginData, @Res() response: Response) {
    console.log(loginData);
    try {
      const res = await this.usersService.loginUser(loginData);

      response.status(HttpStatus.OK).send({
        message: 'successfully-logged-in',
        data: res,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'a-server-error-occurred',
        });
      }
    }
  }

  @Patch('activate-account')
  async activateAccount(
    @Query('userEmail') userEmail: string,
    @Res() response: Response,
  ) {
    try {
      await this.usersService.activateAccount(userEmail);
      response.status(HttpStatus.OK).send({
        message: 'your-account-has-been-successfully-activated',
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'a-server-error-occurred',
        });
      }
    }
  }
}
