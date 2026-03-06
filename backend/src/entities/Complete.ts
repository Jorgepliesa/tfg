import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CoopChallenge } from './CoopChallenge';
import { Avatar } from './Avatar';
import { ApiProperty } from '@nestjs/swagger';

@Entity('complete')
@Index('complete_pkey', ['challenge', 'avatar'], { unique: true })
export class Complete {
  @ApiProperty({
    example: 'challenge1',
    description: 'The name of the completed challenge',
  })
  @PrimaryColumn({ type: 'varchar', length: 255, name: 'challenge' })
  challenge: string;

  @ApiProperty({
    example: 1,
    description: 'The ID of the avatar who completed the challenge',
  })
  @PrimaryColumn({ type: 'integer', name: 'avatar' })
  avatar: number;

  @ManyToOne(() => CoopChallenge)
  @JoinColumn({ name: 'challenge', referencedColumnName: 'name' })
  challengeEntity: CoopChallenge;

  @ManyToOne(() => Avatar, avatar => avatar.completes)
  @JoinColumn({ name: 'avatar' })
  avatarEntity: Avatar;
}