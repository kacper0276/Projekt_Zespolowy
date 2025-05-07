import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamInitesService } from './team-invites.service';
import { Response } from 'express';
import { CreateTeamDto } from './dto/create-team.dto';
import { RespondToInviteDto } from './dto/respond-to-invite.dto';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly teamInvitesService: TeamInitesService,
  ) {}

  @Get('user/:userId')
  async getTeamsByUserId(
    @Param('userId') userId: string,
    @Res() response: Response,
  ) {
    try {
      const teams = await this.teamsService.getTeamsByUserId(userId);
      response.status(HttpStatus.OK).send({
        message: 'teams-retrieved',
        data: teams,
      });
    } catch (error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Get('invites/:userId')
  async getInvitesByUserId(
    @Param('userId') userId: string,
    @Res() response: Response,
  ) {
    try {
      const invites = await this.teamInvitesService.getInvitesByUserId(userId);
      response.status(HttpStatus.OK).send({
        message: 'invites-retrieved',
        data: invites,
      });
    } catch (error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Post()
  async createTeam(@Body() data: CreateTeamDto, @Res() response: Response) {
    try {
      await this.teamsService.createTeam(data);
      response.status(HttpStatus.CREATED).send({
        message: 'team-created',
      });
    } catch (error) {
      console.log(error);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }

  @Post('invites/:inviteId/respond')
  async respondToInvite(
    @Param('inviteId') inviteId: string,
    @Body() respondToInviteDto: RespondToInviteDto,
    @Res() response: Response,
  ) {
    try {
      const { userId, action } = respondToInviteDto;
      await this.teamsService.respondToInvite(inviteId, userId, action);

      response.status(HttpStatus.OK).send({
        message: 'invite-responded',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
        });
      }
      if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({
          message: error.message,
        });
      }

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'internal-server-error',
      });
    }
  }
}
