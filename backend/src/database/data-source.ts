import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ColumnEntity } from '../columns/entities/column.entity';
import { Kanban } from '../kanban/entities/kanban.entity';
import { Status } from '../status/entities/status.entity';
import { Task } from '../tasks/entities/task.entity';
import { ToDoList } from '../to-do-lists/entities/to-do-list.entity';
import { ToDoItem } from '../to-do-lists/entities/to-do-item.entity';
import { Row } from '../rows/entities/row.entity';
import { KanbanSetting } from '../kanban-settings/entities/kanban-setting.entity';
import { Team } from '../teams/entities/team.entity';
import { TeamInvite } from '../teams/entities/team-invite.entity';
import { Comment } from '../comments/entity/comment.entity';
import { Message } from '../messages/entities/message.entity';
import { Conversation } from '../conversations/entities/conversation.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 3307,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'test',
  synchronize: false,
  logging: true,
  entities: [
    User,
    ColumnEntity,
    Kanban,
    Status,
    Task,
    ToDoList,
    Message,
    Conversation,
    ToDoItem,
    Row,
    KanbanSetting,
    Team,
    TeamInvite,
    Comment,
  ],
  migrations: ['migrations/**/*.ts'],
  migrationsTableName: 'migrations_typeorm',
});
