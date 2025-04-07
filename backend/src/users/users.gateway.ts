import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from './users.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class UserStatusGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(UserStatusGateway.name);
  constructor(private readonly usersService: UsersService) {}

  afterInit(server: any) {
    this.logger.log('Gateway Initialized');
  }

  async handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId;
    await this.usersService.updateUserStatus(+userId, true);
    this.logger.log(`User ${userId} connected`);
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.handshake.query.userId;
    await this.usersService.updateUserStatus(+userId, false);
    this.logger.log(`User ${userId} disconnected`);
  }
}
