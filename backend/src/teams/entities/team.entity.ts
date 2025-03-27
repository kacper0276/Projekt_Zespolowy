import { BaseEntity } from 'src/entities/base.entity';
import { Entity } from 'typeorm';

@Entity('teams')
export class Team extends BaseEntity {}
