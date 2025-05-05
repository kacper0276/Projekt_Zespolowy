import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamInvite } from './entities/team-invite.entity';
import { InviteStatus } from 'src/enums/invite-status.enum';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamInvite)
    private readonly teamInviteRepository: Repository<TeamInvite>,
  ) {}

  async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    try {
      const team = this.teamRepository.create({ name: createTeamDto.teamName });
      const savedTeam = await this.teamRepository.save(team);

      const invites = createTeamDto.users.map((user) => {
        return this.teamInviteRepository.create({
          team: savedTeam,
          user: user,
          invitedBy: createTeamDto.invitedBy.id,
          status: InviteStatus.PENDING,
        });
      });

      await this.teamInviteRepository.save(invites);

      return savedTeam;
    } catch (error) {
      console.error('Error creating team:', error.message);
    }
  }

  async getAllTeams(): Promise<Team[]> {
    return this.teamRepository.find();
  }

  async getTeamById(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id: +id } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async getTeamsByUserId(userId: string): Promise<Team[]> {
    return this.teamRepository.find({
      where: { users: { id: +userId } },
      relations: ['users'],
    });
  }

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.getTeamById(id);
    Object.assign(team, updateTeamDto);
    return this.teamRepository.save(team);
  }

  async deleteTeam(id: string): Promise<void> {
    const team = await this.getTeamById(id);
    await this.teamRepository.remove(team);
  }
}
