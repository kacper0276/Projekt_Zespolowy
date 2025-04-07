import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ColumnEntity } from '../columns/entities/column.entity';
import { Kanban } from '../kanban/entities/kanban.entity';
import { Status } from '../status/entities/status.entity';
import { Task } from '../tasks/entities/task.entity';
import { ToDoList } from '../to-do-lists/entities/to-do-list.entity';
import { ToDoItem } from 'src/to-do-lists/entities/to-do-item.entity';
import { Row } from 'src/rows/entities/row.entity';
import { KanbanSetting } from 'src/kanban-settings/entities/kanban-setting.entity';
import { Team } from 'src/teams/entities/team.entity';
import { TeamInvite } from 'src/teams/entities/team-invite.entity';
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
    ToDoItem,
    Row,
    KanbanSetting,
    Team,
    TeamInvite,
  ],
  migrations: ['migrations/**/*.ts'],
  migrationsTableName: 'migrations_typeorm',
});
