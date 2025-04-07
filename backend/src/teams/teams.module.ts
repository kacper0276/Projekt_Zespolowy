import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamInvite } from './entities/team-invite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamInvite])],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
