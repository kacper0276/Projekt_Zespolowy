import { Conversation } from '../../conversations/entities/conversation.entity';
import { BaseEntity } from '../../entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('messages')
export class Message extends BaseEntity {
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @Column()
  content: string;

  @Column({ default: false })
  isRead: boolean;
}
