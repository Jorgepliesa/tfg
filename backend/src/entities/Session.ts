import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Execute } from "./Execute";
import { UserAccount } from "./UserAccount";
import { WellnessTest } from "./WellnessTest";
import { ApiProperty } from "@nestjs/swagger";
import { Routine } from "./Routine";

@Index("session_date_idx", ["date"], {})
@Index("session_pkey", ["date", "userId"], { unique: true })
@Entity("session", { schema: "public" })
@Check('"duration" >= 0 AND "duration" <= 1440')
export class Session {
  @ApiProperty({
    example: "2024-06-01T00:00:00Z",
    description: "The date and time of the session",
  })
  @PrimaryColumn({ type: 'timestamp with time zone', name: 'date' })
  date: Date;

  @ApiProperty({
    example: 1,
    description: "The unique identifier of the user account",
  })
  @PrimaryColumn({ type: "integer", name: "user_id" })
  userId: number;

  @ApiProperty({
    example: 30,
    description: "The duration of the session in minutes",
  })
  @Column({ type: "numeric", name: "duration" })
  duration: number;

  @ApiProperty({
    example: "Morning Routine",
    description: "The routine followed during the session",
  })
  @Column({ type: "varchar", name: "routine", length: 255 })
  routine: string;

  @ApiProperty({
    example: false,
    description: "Whether the session is a cooperative session",
  })
  @Column({ type: "boolean", name: "is_coop" })
  isCoop: boolean;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.sessions)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  userAccount: UserAccount;

  @OneToMany(() => WellnessTest, (wellnessTest) => wellnessTest.session)
  wellnessTests: WellnessTest[];

  @ManyToOne(() => Routine)
  @JoinColumn([{ name: "routine", referencedColumnName: "name" }])
  routineEntity: Routine;

  @OneToMany(() => Execute, (execute) => execute.sessionEntity)
  executes: Execute[];
}
