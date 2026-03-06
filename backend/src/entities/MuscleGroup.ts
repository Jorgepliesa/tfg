import { Column, Entity, Index, ManyToMany, PrimaryColumn } from "typeorm";
import { Exercise } from "./Exercise";
import { ApiProperty } from "@nestjs/swagger";

@Index("muscle_group_pkey", ["name"], { unique: true })
@Entity("muscle_group", { schema: "public" })
export class MuscleGroup {
  @ApiProperty({
    example: 'Biceps',
    description: 'The unique name of the muscle group',
  })
  @PrimaryColumn({type: "varchar", name: "name", length: 255 })
  name: string;

  @ManyToMany(() => Exercise, (exercise) => exercise.muscleGroups)
  exercises: Exercise[];
}
