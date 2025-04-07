import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { KanbanModule } from './kanban/kanban.module';
import { TasksModule } from './tasks/tasks.module';
import { StatusModule } from './status/status.module';
import { ColumnsModule } from './columns/columns.module';
import { ToDoListsModule } from './to-do-lists/to-do-lists.module';
import { ColumnEntity } from './columns/entities/column.entity';
import { Kanban } from './kanban/entities/kanban.entity';
import { Status } from './status/entities/status.entity';
import { Task } from './tasks/entities/task.entity';
import { ToDoList } from './to-do-lists/entities/to-do-list.entity';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { Message } from './messages/entities/message.entity';
import { Conversation } from './conversations/entities/conversation.entity';
import { ToDoItem } from './to-do-lists/entities/to-do-item.entity';
import { TeamsModule } from './teams/teams.module';
import { RowsModule } from './rows/rows.module';
import { Row } from './rows/entities/row.entity';
import { KanbanSettingsModule } from './kanban-settings/kanban-settings.module';
import { KanbanSetting } from './kanban-settings/entities/kanban-setting.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: +process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'test',
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
      ],
      synchronize: true,
      migrations: ['../migrations/**/*.ts'],
      migrationsTableName: 'migrations_typeorm',
    }),
    AuthModule,
    UsersModule,
    KanbanModule,
    TasksModule,
    StatusModule,
    ColumnsModule,
    ToDoListsModule,
    ConversationsModule,
    MessagesModule,
    TeamsModule,
    RowsModule,
    KanbanSettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
