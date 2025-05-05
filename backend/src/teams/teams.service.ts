import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
  ) {}

  async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create(createTeamDto);
    return this.teamRepository.save(team);
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
