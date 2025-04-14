import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from '../config/mailer.config';
import { UserStatusGateway } from './users.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailerModule.forRoot(mailerConfig),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserStatusGateway],
  exports: [UsersService],
})
export class UsersModule {}
