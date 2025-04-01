import { Controller } from '@nestjs/common';
import { RowsService } from './rows.service';

@Controller('rows')
export class RowsController {
  constructor(private readonly rowsService: RowsService) {}
}
