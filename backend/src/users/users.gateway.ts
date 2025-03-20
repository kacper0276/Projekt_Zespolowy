import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from './users.service';

@WebSocketGateway({ cors: true })
export class UserStatusGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly usersService: UsersService) {}

  afterInit(server: any) {
    console.log('Gateway Initialized');
  }

  async handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId;
    await this.usersService.updateUserStatus(+userId, true);
    console.log(`User ${userId} connected`);
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.handshake.query.userId;
    await this.usersService.updateUserStatus(+userId, false);
    console.log(`User ${userId} disconnected`);
  }
}
