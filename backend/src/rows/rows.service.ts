import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Row } from './entities/row.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RowsService {
  constructor(
    @InjectRepository(Row) private readonly rowRepository: Repository<Row>,
  ) {}
}
