import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createConversationDto: CreateConversationDto,
    userIds: number[],
  ): Promise<Conversation> {
    const participants = await this.userRepository.findByIds(userIds);
    const conversation = this.conversationRepository.create({
      participants,
      groupName: createConversationDto.groupName,
      isGroupChat: createConversationDto.isGroupChat,
    });

    return this.conversationRepository.save(conversation);
  }

  async findByUser(userId: number): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }
}
