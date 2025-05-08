import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { RegisterData } from './dto/register-data.dto';
import { LoginData } from './dto/login-data.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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
    @Body() registerData: RegisterData,
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
  async loginUser(@Body() loginData: LoginData, @Res() response: Response) {
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

  @Get('by-email')
  async getUserByEmail(
    @Query('userEmail') userEmail: string,
    @Res() response: Response,
  ) {
    try {
      const user = await this.usersService.findOneByEmail(userEmail);
      response.status(HttpStatus.OK).send({
        message: 'user-found',
        data: user,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'a-server-error-occurred',
        });
      }
    }
  }

  @Get('search')
  async getUsers(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('search') search: string = '',
    @Res() response: Response,
  ) {
    try {
      const users = await this.usersService.getUsers(page, pageSize, search);
      response.status(HttpStatus.OK).send({
        message: 'users-found',
        data: users,
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

  @Patch('change-password')
  async changePassword(
    @Body() changePasswordData: ChangePasswordDto,
    @Res() response: Response,
  ) {
    try {
      const res = await this.usersService.changePassword(changePasswordData);
      response.status(HttpStatus.OK).send({
        message: 'password-changed-successfully',
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
}
