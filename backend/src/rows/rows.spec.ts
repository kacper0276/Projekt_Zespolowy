import { Test, TestingModule } from '@nestjs/testing';
import { RowsService } from './rows.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Row } from './entities/row.entity';
import { Kanban } from '../kanban/entities/kanban.entity';
import { LessThan, Repository } from 'typeorm';

describe('RowsService', () => {
  let service: RowsService;
  let rowRepository: Repository<Row>;
  let kanbanRepository: Repository<Kanban>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RowsService,
        {
          provide: getRepositoryToken(Row),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Kanban),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RowsService>(RowsService);
    rowRepository = module.get<Repository<Row>>(getRepositoryToken(Row));
    kanbanRepository = module.get<Repository<Kanban>>(
      getRepositoryToken(Kanban),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addRowToKanban', () => {
    it('should add a row to a kanban board', async () => {
      const mockKanban = { id: 1, rows: [] } as Kanban;
      const createRowDto = { name: 'New Row' };
      const mockRow = { id: 1, name: 'New Row', order: 0 } as Row;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);
      jest.spyOn(rowRepository, 'create').mockReturnValue(mockRow);
      jest.spyOn(rowRepository, 'save').mockResolvedValue(mockRow);

      const result = await service.addRowToKanban('1', createRowDto);

      expect(kanbanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['rows'],
      });
      expect(rowRepository.create).toHaveBeenCalledWith({
        ...createRowDto,
        kanban: mockKanban,
        order: 0,
      });
      expect(rowRepository.save).toHaveBeenCalledWith(mockRow);
      expect(result).toEqual(mockRow);
    });

    it('should throw an error if kanban board is not found', async () => {
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.addRowToKanban('1', { name: 'New Row' }),
      ).rejects.toThrow('Kanban not found');
    });
  });

  describe('updateRowOrder', () => {
    it('should update the order of rows', async () => {
      const mockKanban = {
        id: 1,
        rows: [
          { id: 1, name: 'Row 1', order: 0 },
          { id: 2, name: 'Row 2', order: 1 },
        ],
      } as Kanban;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);
      jest.spyOn(rowRepository, 'save').mockResolvedValue(null);

      await service.updateRowOrder('1', ['Row 2', 'Row 1']);

      expect(kanbanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['rows'],
      });
      expect(rowRepository.save).toHaveBeenCalledWith([
        { id: 2, name: 'Row 2', order: 0 },
        { id: 1, name: 'Row 1', order: 1 },
      ]);
    });

    it('should throw an error if kanban board is not found', async () => {
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateRowOrder('1', ['Row 1'])).rejects.toThrow(
        'Kanban not found',
      );
    });

    it('should throw an error if some rows are not found', async () => {
      const mockKanban = {
        id: 1,
        rows: [{ id: 1, name: 'Row 1', order: 0 }],
      } as Kanban;

      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValue(mockKanban);

      await expect(
        service.updateRowOrder('1', ['Row 1', 'Row 2']),
      ).rejects.toThrow('Some rows not found');
    });
  });

  describe('editWitLimit', () => {
    it('should update the WIP limit of a row', async () => {
      const mockRow = { id: 1, maxTasks: 5 } as Row;

      jest.spyOn(rowRepository, 'findOne').mockResolvedValue(mockRow);
      jest.spyOn(rowRepository, 'save').mockResolvedValue(null);

      await service.editWitLimit('1', 10);

      expect(rowRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(rowRepository.save).toHaveBeenCalledWith({
        ...mockRow,
        maxTasks: 10,
      });
    });

    it('should throw an error if row is not found', async () => {
      jest.spyOn(rowRepository, 'findOne').mockResolvedValue(null);

      await expect(service.editWitLimit('1', 10)).rejects.toThrow(
        'Row not found',
      );
    });
  });

  describe('deleteRow', () => {
    it('should delete a row and move its tasks to the previous row', async () => {
      const mockRow = {
        id: 1,
        order: 1,
        tasks: [{ id: 1, name: 'Task 1' }],
      } as Row;
      const mockPreviousRow = {
        id: 2,
        order: 0,
        tasks: [{ id: 2, name: 'Task 2' }],
      } as Row;

      jest
        .spyOn(rowRepository, 'findOne')
        .mockResolvedValueOnce(mockRow)
        .mockResolvedValueOnce(mockPreviousRow);
      jest.spyOn(rowRepository, 'save').mockResolvedValue(null);
      jest.spyOn(rowRepository, 'remove').mockResolvedValue(null);

      await service.deleteRow('1');

      expect(rowRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['tasks'],
      });
      expect(rowRepository.findOne).toHaveBeenCalledWith({
        where: { order: LessThan(1) },
        relations: ['tasks'],
        order: { order: 'DESC' },
      });
      expect(rowRepository.save).toHaveBeenCalledWith({
        ...mockPreviousRow,
        tasks: [...mockPreviousRow.tasks, ...mockRow.tasks],
      });
      expect(rowRepository.remove).toHaveBeenCalledWith(mockRow);
    });

    it('should throw an error if row is not found', async () => {
      jest.spyOn(rowRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteRow('1')).rejects.toThrow('Row not found');
    });
  });
});
