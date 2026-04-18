import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Exercise } from "./Exercise";
import { Session } from "./Session";
import { ApiProperty } from "@nestjs/swagger";

@Index("execute_pkey", ["exercise", "session", "userId"], { unique: true })
@Entity("execute", { schema: "public" })
@Check(`"num_reps_done" >= 0 AND "num_reps_done" < 1000`)
@Check(`"t_final" > "t_initial"`)
export class Execute {
  @ApiProperty({ 
    type: 'string', 
    format: 'date-time',
    description: "The date and time of the session when the exercise was performed",
    example: "2024-06-01T10:00:00Z"
  })
  @PrimaryColumn({type: "timestamp with time zone", name: "session" })
  session: Date;

  @ApiProperty({
    example: 1,
    description: "The unique identifier of the user account who performed the exercise",
  }) 
  @PrimaryColumn({type: "integer", name: "user_id" })
  userId: number;

  @ApiProperty({
    example: "Push-ups",
    description: "The name of the exercise performed",
  })
  @PrimaryColumn({type: "varchar", name: "exercise" })
  exercise: string;

  @ApiProperty({
    example: 20,
    description: "The number of repetitions done for the exercise",
  })
  @Column("integer", { name: "num_reps_done" })
  numRepsDone: number;

  @ApiProperty({ 
    type: 'string', 
    format: 'date-time',
    description: "The date and time when the exercise started",
    example: "2024-06-01T10:00:00Z"
  })
  @Column({type: "timestamp with time zone", name: "t_initial" })
  tInitial: Date;

  @ApiProperty({ 
    type: 'string', 
    format: 'date-time',
    description: "The date and time when the exercise ended",
    example: "2024-06-01T10:30:00Z"
  })
  @Column({type: "timestamp with time zone", name: "t_final" })
  tFinal: Date;

  @ManyToOne(() => Exercise) // unidireccional: Execute -> exercise
  @JoinColumn([{ name: "exercise", referencedColumnName: "name" }])
  exerciseEntity: Exercise;

  @ManyToOne(() => Session, (session) => session.executes)
  @JoinColumn([
    { name: "session", referencedColumnName: "date" },
    { name: "user_id", referencedColumnName: "userId" },
  ])
  sessionEntity: Session;
}
