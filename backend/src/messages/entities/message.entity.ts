import { Conversation } from '../../conversations/entities/conversation.entity';
import { BaseEntity } from '../../entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';

@Entity('messages')
export class Message extends BaseEntity {
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @Column()
  senderId: number;

  @Column('text')
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
