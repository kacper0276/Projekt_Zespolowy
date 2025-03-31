import { Body, Controller, Post, Res } from '@nestjs/common';
import { ToDoListsService } from './to-do-lists.service';
import { CreateToDoListDto } from './dto/create-to-do-list.dto';
import { Response } from 'express';

@Controller('to-do-lists')
export class ToDoListsController {
  constructor(private readonly toDoListsService: ToDoListsService) {}

  @Post()
  async create(
    @Body() createToDoListDto: CreateToDoListDto,
    @Res() response: Response,
  ) {
    return this.toDoListsService.create(createToDoListDto);
  }
}
