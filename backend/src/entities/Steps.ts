import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserAccount } from "./UserAccount";
import { ApiProperty } from "@nestjs/swagger";

@Index("steps_pkey", ["date", "userId"], { unique: true })
@Index("steps_date_idx", ["date"], {})
@Entity("steps", { schema: "public" })
@Check(`"num_steps" >= 0 AND "num_steps" <= 1000000`)
export class Steps {
  @ApiProperty({
    example: "2024-06-01T00:00:00Z",
    description: "The date of the steps record",
  })
  @PrimaryColumn({ type: 'timestamp with time zone', name: 'date' })
  date: Date;

  @ApiProperty({
    example: 1,
    description: "The unique identifier of the user account",
  })
  @PrimaryColumn({ type: 'int', name: 'user_id' })
  userId: number;

  @ApiProperty({
    example: 10000,
    description: "The number of steps taken by the user",
  })
  @Column({ type: 'int', name: 'num_steps' })
  numSteps: number;

  @ApiProperty({
    example: false,
    description: "Whether the step goal was reached",
  })
  @Column({ type: 'boolean', name: 'is_reached', default: false })
  isReached: boolean;

  @ManyToOne(() => UserAccount, (userAccount) => userAccount.steps)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  userAccount: UserAccount;
}
