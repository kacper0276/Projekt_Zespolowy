import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ColumnEntity } from '../columns/entities/column.entity';
import { Kanban } from '../kanban/entities/kanban.entity';
import { Status } from '../status/entities/status.entity';
import { Task } from '../tasks/entities/task.entity';
import { ToDoList } from '../to-do-lists/entities/to-do-list.entity';
import { ToDoItem } from 'src/to-do-lists/entities/to-do-item.entity';
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
  entities: [User, ColumnEntity, Kanban, Status, Task, ToDoList, ToDoItem],
  migrations: ['migrations/**/*.ts'],
  migrationsTableName: 'migrations_typeorm',
});
