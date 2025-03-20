import { Body, Controller, Param, Post } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post(':kanbanId')
  async addColumnToKanban(
    @Param('kanbanId') kanbanId: string,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    return await this.columnsService.addColumnToKanban(
      kanbanId,
      createColumnDto,
    );
  }
}
