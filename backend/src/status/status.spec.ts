import { Test, TestingModule } from '@nestjs/testing';
import { StatusService } from './status.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';
import { Kanban } from '../kanban/entities/kanban.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('StatusService', () => {
  let service: StatusService;
  let statusRepository: Repository<Status>;
  let kanbanRepository: Repository<Kanban>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        {
          provide: getRepositoryToken(Status),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Kanban),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<StatusService>(StatusService);
    statusRepository = module.get<Repository<Status>>(
      getRepositoryToken(Status),
    );
    kanbanRepository = module.get<Repository<Kanban>>(
      getRepositoryToken(Kanban),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatusForKanban', () => {
    it('should return statuses for a kanban board', async () => {
      const mockStatuses = [
        { id: 1, name: 'To Do' },
        { id: 2, name: 'In Progress' },
      ] as Status[];

      jest.spyOn(statusRepository, 'find').mockResolvedValue(mockStatuses);

      const result = await service.getStatusForKanban('1');

      expect(statusRepository.find).toHaveBeenCalledWith({
        where: { kanban: { id: 1 } },
      });
      expect(result).toEqual(mockStatuses);
    });

    it('should throw an error if no statuses are found', async () => {
      jest.spyOn(statusRepository, 'find').mockResolvedValue([]);

      await expect(service.getStatusForKanban('1')).rejects.toThrow(
        'not-found-statuses-for-kanban',
      );
    });
  });

  describe('createNewStatus', () => {
    it('should create a new status for a kanban board', async () => {
      const mockKanban = { id: 1 } as Kanban;
      const createNewStatusDto = {
        name: 'Done',
        color: '#00FF00',
        kanbanId: '1',
      };
      const mockStatus = {
        id: 1,
        name: 'Done',
        color: '#00FF00',
        kanban: mockKanban,
      } as Status;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);
      jest.spyOn(statusRepository, 'save').mockResolvedValue(mockStatus);

      const result = await service.createNewStatus(createNewStatusDto);

      expect(kanbanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(statusRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Done',
          color: '#00FF00',
          kanban: mockKanban,
        }),
      );
      expect(result).toEqual(mockStatus);
    });

    it('should throw an error if kanban board is not found', async () => {
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createNewStatus({
          name: 'Done',
          color: '#00FF00',
          kanbanId: '1',
        }),
      ).rejects.toThrow('not-found-kanban');
    });
  });

  describe('deleteStatus', () => {
    it('should delete a status', async () => {
      const mockStatus = { id: 1, name: 'To Do' } as Status;

      jest.spyOn(statusRepository, 'findOne').mockResolvedValue(mockStatus);
      jest.spyOn(statusRepository, 'remove').mockResolvedValue(null);

      await service.deleteStatus('1');

      expect(statusRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(statusRepository.remove).toHaveBeenCalledWith(mockStatus);
    });

    it('should throw an error if status is not found', async () => {
      jest.spyOn(statusRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteStatus('1')).rejects.toThrow(
        'not-found-status',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update a status', async () => {
      const mockStatus = { id: 1, name: 'To Do', color: '#FFFFFF' } as Status;
      const updateStatusDto = { name: 'Done', color: '#00FF00' };

      jest.spyOn(statusRepository, 'findOne').mockResolvedValue(mockStatus);
      jest.spyOn(statusRepository, 'save').mockResolvedValue(null);

      await service.updateStatus('1', updateStatusDto);

      expect(statusRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(statusRepository.save).toHaveBeenCalledWith({
        ...mockStatus,
        name: 'Done',
        color: '#00FF00',
      });
    });

    it('should throw an error if status is not found', async () => {
      jest.spyOn(statusRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateStatus('1', { name: 'Done', color: '#00FF00' }),
      ).rejects.toThrow('not-found-status');
    });
  });
});
