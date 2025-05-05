import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamInvite } from './entities/team-invite.entity';
import { TeamInitesService } from './team-invites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamInvite])],
  controllers: [TeamsController],
  providers: [TeamsService, TeamInitesService],
})
export class TeamsModule {}
