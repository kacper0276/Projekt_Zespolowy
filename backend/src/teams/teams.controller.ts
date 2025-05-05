import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamInitesService } from './team-invites.service';
import { Response } from 'express';
import { CreateTeamDto } from './dto/create-team.dto';

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
}
