import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ColumnEntity } from './entities/column.entity';
import { Kanban } from '../kanban/entities/kanban.entity';
import { LessThan, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ColumnsService', () => {
  let service: ColumnsService;
  let columnRepository: Repository<ColumnEntity>;
  let kanbanRepository: Repository<Kanban>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: getRepositoryToken(ColumnEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Kanban),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    columnRepository = module.get<Repository<ColumnEntity>>(
      getRepositoryToken(ColumnEntity),
    );
    kanbanRepository = module.get<Repository<Kanban>>(
      getRepositoryToken(Kanban),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addColumnToKanban', () => {
    it('should add a column to a kanban board', async () => {
      const mockKanban = { id: 1, columns: [] } as Kanban;
      const createColumnDto = { name: 'New Column' };
      const mockColumn = {
        id: 1,
        name: 'New Column',
        order: 0,
      } as ColumnEntity;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);
      jest.spyOn(columnRepository, 'create').mockReturnValue(mockColumn);
      jest.spyOn(columnRepository, 'save').mockResolvedValue(mockColumn);

      const result = await service.addColumnToKanban('1', createColumnDto);

      expect(kanbanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['columns'],
      });
      expect(columnRepository.create).toHaveBeenCalledWith({
        ...createColumnDto,
        kanban: mockKanban,
        order: 0,
      });
      expect(columnRepository.save).toHaveBeenCalledWith(mockColumn);
      expect(result).toEqual(mockColumn);
    });

    it('should throw an error if kanban board is not found', async () => {
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.addColumnToKanban('1', { name: 'New Column' }),
      ).rejects.toThrow('Kanban not found');
    });
  });

  describe('updateColumnOrder', () => {
    it('should update the order of columns', async () => {
      const mockKanban = {
        id: 1,
        columns: [
          { id: 1, name: 'Column 1', order: 0 },
          { id: 2, name: 'Column 2', order: 1 },
        ],
      } as Kanban;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);
      jest.spyOn(columnRepository, 'save').mockResolvedValue(null);

      await service.updateColumnOrder('1', ['Column 2', 'Column 1']);

      expect(kanbanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['columns'],
      });
      expect(columnRepository.save).toHaveBeenCalledWith([
        { id: 2, name: 'Column 2', order: 0 },
        { id: 1, name: 'Column 1', order: 1 },
      ]);
    });

    it('should throw an error if kanban board is not found', async () => {
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateColumnOrder('1', ['Column 1']),
      ).rejects.toThrow('Kanban not found');
    });

    it('should throw an error if some columns are not found', async () => {
      const mockKanban = {
        id: 1,
        columns: [{ id: 1, name: 'Column 1', order: 0 }],
      } as Kanban;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);

      await expect(
        service.updateColumnOrder('1', ['Column 1', 'Column 2']),
      ).rejects.toThrow('Some columns not found');
    });
  });

  describe('editWipLimit', () => {
    it('should update the WIP limit of a column', async () => {
      const mockColumn = { id: 1, maxTasks: 5 } as ColumnEntity;

      jest.spyOn(columnRepository, 'findOne').mockResolvedValue(mockColumn);
      jest.spyOn(columnRepository, 'save').mockResolvedValue(null);

      await service.editWipLimit('1', 10);

      expect(columnRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(columnRepository.save).toHaveBeenCalledWith({
        ...mockColumn,
        maxTasks: 10,
      });
    });

    it('should throw an error if column is not found', async () => {
      jest.spyOn(columnRepository, 'findOne').mockResolvedValue(null);

      await expect(service.editWipLimit('1', 10)).rejects.toThrow(
        'Column not found',
      );
    });
  });

  describe('deleteColumn', () => {
    it('should delete a column and move its tasks to the previous column', async () => {
      const mockColumn = {
        id: 1,
        order: 1,
        tasks: [{ id: 1, name: 'Task 1' }],
      } as ColumnEntity;
      const mockPreviousColumn = {
        id: 2,
        order: 0,
        tasks: [{ id: 2, name: 'Task 2' }],
      } as ColumnEntity;

      jest
        .spyOn(columnRepository, 'findOne')
        .mockResolvedValueOnce(mockColumn)
        .mockResolvedValueOnce(mockPreviousColumn);
      jest.spyOn(columnRepository, 'save').mockResolvedValue(null);
      jest.spyOn(columnRepository, 'remove').mockResolvedValue(null);

      await service.deleteColumn(1);

      expect(columnRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['tasks'],
      });
      expect(columnRepository.findOne).toHaveBeenCalledWith({
        where: {
          order: LessThan(1),
        },
        relations: ['tasks'],
        order: {
          order: 'DESC',
        },
      });
      expect(columnRepository.save).toHaveBeenCalledWith({
        ...mockPreviousColumn,
        tasks: [...mockPreviousColumn.tasks, ...mockColumn.tasks],
      });
      expect(columnRepository.remove).toHaveBeenCalledWith(mockColumn);
    });

    it('should throw an error if column is not found', async () => {
      jest.spyOn(columnRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteColumn(1)).rejects.toThrow('Column not found');
    });
  });
});
