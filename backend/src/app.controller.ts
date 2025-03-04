import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return `${process.env.DB_HOST} ${process.env.DB_PORT} ${process.env.DB_USER}`;
  }
}
