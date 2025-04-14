import { BaseEntity } from '../../entities/base.entity';
import { Message } from '../../messages/entities/message.entity';
import { User } from '../../users/entities/user.entity';
import { Entity, ManyToMany, JoinTable, OneToMany, Column } from 'typeorm';

@Entity('conversations')
export class Conversation extends BaseEntity {
  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @Column({ nullable: true })
  groupName: string;

  @Column({ default: false })
  isGroupChat: boolean;

  @Column({ default: true })
  isActive: boolean;
}
