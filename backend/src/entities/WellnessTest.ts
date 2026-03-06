import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Session } from "./Session";
import { ApiProperty } from "@nestjs/swagger";

export enum WellnessTestType {
  INITIAL = 'initial',
  FINAL = 'final',
}

@Index("wellness_test_pkey", ["session", "type", "userAccount"], {
  unique: true,
})
@Entity("wellness_test", { schema: "public" })
@Check('"pain" >= 1 AND "pain" <= 5')
@Check('"sleepiness" >= 1 AND "sleepiness" <= 5')
@Check('"mood" >= 1 AND "mood" <= 5')
@Check('"fatigue" >= 1 AND "fatigue" <= 5')
export class WellnessTest {
  @ApiProperty({ 
    type: 'string', 
    format: 'date-time' 
  })
  @PrimaryColumn({type: "timestamp with time zone", name: "session" })
  session: Date;

  @ApiProperty({
    example: 1,
    description: "The unique identifier of the user account",
  })
  @PrimaryColumn({type: "integer", name: "user_account" })
  userAccount: number;

  @ApiProperty({
    example: WellnessTestType.INITIAL,
    description: "The type of the wellness test",
  })
  @PrimaryColumn({type: "enum", name: "type", enum: WellnessTestType })
  type: WellnessTestType;

  @ApiProperty({
    example: 1,
    description: "The pain level",
  })
  @Column("integer", { name: "pain" })
  pain: number;

  @ApiProperty({
    example: 1,
    description: "The sleepiness level",
  })
  @Column("integer", { name: "sleepiness" })
  sleepiness: number;

  @ApiProperty({
    example: 1,
    description: "The mood level",
  })
  @Column("integer", { name: "mood" })
  mood: number;

  @ApiProperty({
    example: 1,
    description: "The fatigue level",
  })
  @Column("integer", { name: "fatigue" })
  fatigue: number;

  @ManyToOne(() => Session, (session) => session.wellnessTests)
  @JoinColumn([
    { name: "session", referencedColumnName: "date" },
    { name: "user_account", referencedColumnName: "userAccount" },
  ])
  sessionEntity: Session;
}
