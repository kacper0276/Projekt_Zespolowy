import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Response } from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getAllComments(@Res() response: Response) {
    try {
      const comments = await this.commentsService.findAll();
      response.status(HttpStatus.OK).send({
        message: 'comments-retrieved',
        data: comments,
      });
    } catch (error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Get(':id')
  async getCommentById(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    try {
      const comment = await this.commentsService.findOne(id);
      response.status(HttpStatus.OK).send({
        message: 'comment-retrieved',
        data: comment,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
  }

  @Get('task/:taskId')
  async getCommentsByPostId(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Res() response: Response,
  ) {
    try {
      const comments = await this.commentsService.findByTaskId(taskId);
      response.status(HttpStatus.OK).send({
        message: 'comments-retrieved',
        data: comments,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
  }

  @Post()
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Res() response: Response,
  ) {
    try {
      const comment = await this.commentsService.create(createCommentDto);
      response.status(HttpStatus.CREATED).send({
        message: 'comment-created',
        data: comment,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
  }

  @Put(':id')
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Res() response: Response,
  ) {
    try {
      const comment = await this.commentsService.update(id, updateCommentDto);
      response.status(HttpStatus.OK).send({
        message: 'comment-updated',
        data: comment,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
  }

  @Delete(':id')
  async deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    try {
      await this.commentsService.delete(id);
      response.status(HttpStatus.OK).send({
        message: 'comment-deleted',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'internal-server-error',
        });
      }
    }
  }
}
