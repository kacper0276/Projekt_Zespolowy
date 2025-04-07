import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessagesService } from './messages.service';
import { ConversationsService } from 'src/conversations/conversations.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private userSockets: Map<string, number[]> = new Map();

  constructor(
    private readonly messageService: MessagesService,
    private readonly conversationService: ConversationsService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const conversationId = client.handshake.query.conversationId as string;
    const userId = client.handshake.query.userId as string;

    if (!this.userSockets.has(client.id)) {
      this.userSockets.set(client.id, []);
    }
    this.userSockets.get(client.id).push(parseInt(conversationId));

    // const messages = await this.messageService.getMessages(
    //   parseInt(conversationId),
    // );
    // client.emit('previousMessages', messages);

    client.join(conversationId);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const conversationIds = this.userSockets.get(client.id);

    if (conversationIds) {
      for (const conversationId of conversationIds) {
        client.leave(conversationId + '');
      }
      this.userSockets.delete(client.id);
    }
  }
}
