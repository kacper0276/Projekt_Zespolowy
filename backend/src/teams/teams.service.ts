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

  async respondToInvite(
    inviteId: string,
    userId: number,
    action: 'accept' | 'reject',
  ): Promise<string> {
    const invite = await this.teamInviteRepository.findOne({
      where: { id: +inviteId, user: { id: userId } },
      relations: ['team', 'user'],
    });

    if (!invite) {
      throw new NotFoundException(
        `Invite with ID ${inviteId} not found for user ${userId}`,
      );
    }

    if (action === 'accept') {
      const team = await this.teamRepository.findOne({
        where: { id: invite.team.id },
        relations: ['users'],
      });

      if (!team) {
        throw new NotFoundException(`Team with ID ${invite.team.id} not found`);
      }

      const isUserAlreadyInTeam = team.users.some((user) => user.id === userId);
      if (isUserAlreadyInTeam) {
        throw new Error(
          `User with ID ${userId} is already a member of the team`,
        );
      }

      team.users.push(invite.user);
      await this.teamRepository.save(team);

      invite.status = InviteStatus.ACCEPTED;
      await this.teamInviteRepository.save(invite);

      return `Invite accepted. User with ID ${userId} added to team ${team.name}`;
    } else if (action === 'reject') {
      invite.status = InviteStatus.REJECTED;
      await this.teamInviteRepository.save(invite);

      return `Invite rejected by user with ID ${userId}`;
    } else {
      throw new Error(`Invalid action: ${action}`);
    }
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
