import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamInvite } from './entities/team-invite.entity';
import { UpdateTeamInviteDto } from './dto/update-team-invite.dto';
import { CreateTeamInviteDto } from './dto/create-team-invite.dto';
import { User } from '../users/entities/user.entity';
import { first } from 'rxjs';
import { InviteStatus } from 'src/enums/invite-status.enum';

@Injectable()
export class TeamInitesService {
  constructor(
    @InjectRepository(TeamInvite)
    private readonly teamInviteRepository: Repository<TeamInvite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async getInvitesByUserId(userId: string): Promise<
    (TeamInvite & {
      invitedByUser: {
        email: string;
        firstName: string | null;
        lastName: string | null;
      } | null;
    })[]
  > {
    const invites = await this.teamInviteRepository.find({
      where: { user: { id: +userId }, status: InviteStatus.PENDING },
      relations: ['team'],
    });

    const invitesWithInviter = await Promise.all(
      invites.map(async (invite) => {
        const inviter = await this.userRepository.findOne({
          where: { id: invite.invitedBy },
        });

        return {
          id: invite.id,
          team: invite.team,
          invitedBy: inviter.id,
          invitedByUser: inviter
            ? {
                email: inviter.email,
                firstName: inviter.firstName,
                lastName: inviter.lastName,
              }
            : null,
          status: invite.status,
          user: invite.user,
        };
      }),
    );

    return invitesWithInviter;
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
