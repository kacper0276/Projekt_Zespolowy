import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { Conversation } from '../conversations/entities/conversation.entity';
import { Logger } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { send } from 'process';

@WebSocketGateway({ cors: true })
export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(KanbanGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  handleConnection(_client: Socket) {}

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('joinKanbanRoom')
  async handleJoinKanbanRoom(client: Socket, kanbanId: string) {
    client.join(kanbanId);
    this.logger.log(`Client joined room: ${kanbanId}`);

    const conversation = await this.conversationRepository.findOne({
      where: { id: +kanbanId },
      relations: ['messages'],
    });

    if (conversation) {
      const sortedMessages = conversation.messages.sort((a, b) =>
        a.createdAt > b.createdAt ? 1 : -1,
      );
      client.emit('loadMessages', sortedMessages);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: {
      kanbanId: string;
      senderId: number;
      content: string;
      sender: User;
    },
  ) {
    const { kanbanId, senderId, content } = payload;

    let conversation = await this.conversationRepository.findOne({
      where: { id: +kanbanId },
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({ id: +kanbanId });
      await this.conversationRepository.save(conversation);
    }

    const message = this.messageRepository.create({
      conversation,
      senderId,
      content,
      sender: payload.sender,
    });
    await this.messageRepository.save(message);

    this.server.to(kanbanId).emit('receiveMessage', {
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      sender: payload.sender,
    });
  }

  @SubscribeMessage('leaveKanbanRoom')
  handleLeaveKanbanRoom(client: Socket, kanbanId: string): void {
    client.leave(kanbanId);
    this.logger.log(`Client left room: ${kanbanId}`);
  }
}
