import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamInvite } from './entities/team-invite.entity';
import { UpdateTeamInviteDto } from './dto/update-team-invite.dto';
import { CreateTeamInviteDto } from './dto/create-team-invite.dto';

@Injectable()
export class TeamInitesService {
  constructor(
    @InjectRepository(TeamInvite)
    private readonly teamInviteRepository: Repository<TeamInvite>,
  ) {}

  async createInvite(
    createTeamInviteDto: CreateTeamInviteDto,
  ): Promise<TeamInvite> {
    const invite = this.teamInviteRepository.create(createTeamInviteDto);
    return this.teamInviteRepository.save(invite);
  }

  async getAllInvites(): Promise<TeamInvite[]> {
    return this.teamInviteRepository.find({ relations: ['team'] });
  }

  async getInviteById(id: string): Promise<TeamInvite> {
    const invite = await this.teamInviteRepository.findOne({
      where: { id: +id },
      relations: ['team'],
    });
    if (!invite) {
      throw new NotFoundException(`Invite with ID ${id} not found`);
    }
    return invite;
  }

  async updateInvite(
    id: string,
    updateTeamInviteDto: UpdateTeamInviteDto,
  ): Promise<TeamInvite> {
    const invite = await this.getInviteById(id);
    Object.assign(invite, updateTeamInviteDto);
    return this.teamInviteRepository.save(invite);
  }

  async deleteInvite(id: string): Promise<void> {
    const invite = await this.getInviteById(id);
    await this.teamInviteRepository.remove(invite);
  }
}
