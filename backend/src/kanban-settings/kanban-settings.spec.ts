import { Test, TestingModule } from '@nestjs/testing';
import { KanbanSettingsService } from './kanban-settings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KanbanSetting } from './entities/kanban-setting.entity';
import { Repository } from 'typeorm';

describe('KanbanSettingsService', () => {
  let service: KanbanSettingsService;
  let repository: Repository<KanbanSetting>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KanbanSettingsService,
        {
          provide: getRepositoryToken(KanbanSetting),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<KanbanSettingsService>(KanbanSettingsService);
    repository = module.get<Repository<KanbanSetting>>(
      getRepositoryToken(KanbanSetting),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateWipLimit', () => {
    it('should update the WIP limit if the setting exists', async () => {
      const mockKanbanSetting = {
        id: 1,
        user: {
          id: 1,
          email: 'test@example.com',
          login: 'testuser',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          role: null,
          isOnline: false,
        },
        kanban: { id: 1 },
        wipLimit: 5,
      } as KanbanSetting;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockKanbanSetting);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockKanbanSetting,
        wipLimit: 10,
      });

      const result = await service.updateWipLimit('1', '1', 10);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, kanban: { id: 1 } },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockKanbanSetting,
        wipLimit: 10,
      });
      expect(result.wipLimit).toBe(10);
    });

    it('should create a new setting if it does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue({
        user: { id: 1 },
        kanban: { id: 1 },
        wipLimit: 10,
      } as KanbanSetting);
      jest.spyOn(repository, 'save').mockResolvedValue({
        id: 1,
        user: {
          id: 1,
          email: 'test@example.com',
          login: 'testuser',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          role: null,
          isOnline: false,
          conversations: [],
          kanbans: [],
          kanbanSettings: [],
          maxTasks: 0,
          tasks: [],
          messages: [],
          teamInvites: [],
          teams: [],
        },
        kanban: {
          id: 1,
          backgroundImage: null,
          columns: [],
          kanbanSettings: [],
          rows: [],
          statuses: [],
          tasks: [],
          tableName: 'test',
          users: [],
        },
        wipLimit: 10,
      });

      const result = await service.updateWipLimit('1', '1', 10);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, kanban: { id: 1 } },
      });
      expect(repository.create).toHaveBeenCalledWith({
        user: { id: 1 },
        kanban: { id: 1 },
        wipLimit: 10,
      });
      expect(repository.save).toHaveBeenCalledWith({
        user: { id: 1 },
        kanban: { id: 1 },
        wipLimit: 10,
      });
      expect(result.wipLimit).toBe(10);
    });
  });
});
