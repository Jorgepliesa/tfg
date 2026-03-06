import { Check, Column, Entity, Index, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Avatar } from "./Avatar";
import { Complete } from "./Complete";
import { ApiProperty } from "@nestjs/swagger";

export enum CoopChallengeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Index("coop_challenge_pkey", ["name"], { unique: true })
@Entity("coop_challenge", { schema: "public" })
@Check('"end_date" > "start_date"')
export class CoopChallenge {
  @ApiProperty({
    example: 'challenge1',
    description: 'The unique name of the cooperative challenge',
  })
  @PrimaryColumn({ type: "varchar", name: "name", length: 255 })
  name: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'The start date of the cooperative challenge',
  })
  @Column({ type: "timestamp with time zone", name: "start_date" })
  startDate: Date;

  @ApiProperty({
    example: '2023-12-31T23:59:59Z',
    description: 'The end date of the cooperative challenge',
  })
  @Column({ type: "timestamp with time zone", name: "end_date" })
  endDate: Date;

  @ApiProperty({
    example: CoopChallengeStatus.ACTIVE,
    description: 'The status of the cooperative challenge',
  })
  @Column({ type: "enum", name: "status", enum: CoopChallengeStatus })
  status: CoopChallengeStatus;

  @ApiProperty({
    example: 100,
    description: 'The total number of steps in the cooperative challenge',
  })
  @Column({ type: "integer", name: "total_steps" })
  totalSteps: number;

}
