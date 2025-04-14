import { Test, TestingModule } from '@nestjs/testing';
import { KanbanService } from './kanban.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Kanban } from './entities/kanban.entity';
import { User } from '../users/entities/user.entity';
import { ColumnEntity } from '../columns/entities/column.entity';
import { Status } from '../status/entities/status.entity';
import { Task } from '../tasks/entities/task.entity';
import { Row } from '../rows/entities/row.entity';
import { Repository } from 'typeorm';

describe('KanbanService', () => {
  let service: KanbanService;
  let kanbanRepository: Repository<Kanban>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KanbanService,
        {
          provide: getRepositoryToken(Kanban),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ColumnEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Status),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Row),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<KanbanService>(KanbanService);
    kanbanRepository = module.get<Repository<Kanban>>(
      getRepositoryToken(Kanban),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getKanbanById', () => {
    it('should return a kanban board by ID', async () => {
      const kanbanId = 1;
      const mockKanban = { id: kanbanId, tableName: 'Test Kanban' } as Kanban;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);

      const result = await service.getKanbanById(kanbanId);

      expect(result).toEqual(mockKanban);
      expect(kanbanRepository.findOne).toHaveBeenCalledWith({
        where: { id: kanbanId },
        relations: expect.any(Array),
      });
    });

    it('should throw an error if kanban board is not found', async () => {
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getKanbanById(1)).rejects.toThrow(
        'Kanban board not found',
      );
    });
  });

  describe('assignUser', () => {
    it('should assign a user to a kanban board', async () => {
      const kanbanId = 1;
      const userId = 2;
      const mockKanban = { id: kanbanId, users: [] } as Kanban;
      const mockUser = { id: userId } as User;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(kanbanRepository, 'save').mockResolvedValue(mockKanban);

      const result = await service.assignUser(kanbanId, userId);

      expect(result).toEqual(mockKanban);
      expect(kanbanRepository.save).toHaveBeenCalledWith({
        ...mockKanban,
        users: [mockUser],
      });
    });

    it('should throw an error if kanban board is not found', async () => {
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(null);

      await expect(service.assignUser(1, 2)).rejects.toThrow(
        'Kanban board not found',
      );
    });

    it('should throw an error if user is not found', async () => {
      const mockKanban = { id: 1, users: [] } as Kanban;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.assignUser(1, 2)).rejects.toThrow('User not found');
    });
  });

  describe('changeTableName', () => {
    it('should change the table name of a kanban board', async () => {
      const kanbanId = 1;
      const newTableName = 'Updated Table Name';
      const mockKanban = {
        id: kanbanId,
        tableName: 'Old Table Name',
      } as Kanban;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);
      jest.spyOn(kanbanRepository, 'save').mockResolvedValue({
        ...mockKanban,
        tableName: newTableName,
      });

      const result = await service.changeTableName({
        id: kanbanId,
        tableName: newTableName,
      });

      expect(result.tableName).toEqual(newTableName);
      expect(kanbanRepository.save).toHaveBeenCalledWith({
        ...mockKanban,
        tableName: newTableName,
      });
    });

    it('should throw an error if kanban board is not found', async () => {
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.changeTableName({ id: 1, tableName: 'New Name' }),
      ).rejects.toThrow('Kanban board not found');
    });
  });
});
