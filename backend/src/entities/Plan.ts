import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Exercise } from "./Exercise";
import { Routine } from "./Routine";
import { ApiProperty } from "@nestjs/swagger";

@Index("plan_pkey", ["exercise", "routine"], { unique: true })
@Entity("plan", { schema: "public" })
@Check(`("num_reps" > 0 AND "num_reps" < 1000)`)
@Check(`("num_series" > 0 AND "num_series" < 100)`)
@Check(`("duration" > 0 AND "duration" < 1440)`)
@Check(`("rest" >= 0 AND "rest" < 3600)`)
export class Plan {
  @ApiProperty({
    example: 'Rutina de fuerza',
    description: 'The name of the routine this plan belongs to',
  })
  @PrimaryColumn({ type: "varchar", name: "routine", length: 255 })
  routine: string;

  @ApiProperty({
    example: 'Sentadilla',
    description: 'The name of the exercise this plan is for',
  })
  @PrimaryColumn({ type: "varchar", name: "exercise", length: 255 })
  exercise: string;

  @ApiProperty({
    example: 10,
    description: 'The number of repetitions for this exercise',
  })
  @Column({ type: "integer", name: "num_reps" })
  numReps: number;

  @ApiProperty({
    example: 3,
    description: 'The number of series for this exercise',
  })
  @Column({ type: "integer", name: "num_series" })
  numSeries: number;

  @ApiProperty({
    example: '00:30:00',
    description: 'The duration of the exercise, in minutes. Null if the exercise is measured only by reps.',
    nullable: true,
  })
  @Column({ type: "numeric", name: "duration", nullable: true })
  duration: string | null;

  @ApiProperty({
    example: 60,
    description: 'The rest time after the exercise',
  })
  @Column({ type: "integer", name: "rest" })
  rest: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.plans)
  @JoinColumn([{ name: "exercise", referencedColumnName: "name" }])
  exerciseEntity: Exercise;

  @ManyToOne(() => Routine, (routine) => routine.plans)
  @JoinColumn([{ name: "routine", referencedColumnName: "name" }])
  routineEntity: Routine;
}
