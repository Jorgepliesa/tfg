import { Column, Entity, Index, ManyToMany, PrimaryColumn } from "typeorm";
import { Exercise } from "./Exercise";
import { ApiProperty } from "@nestjs/swagger";

@Index("measurement_parameter_pkey", ["name"], { unique: true })
@Entity("measurement_parameter", { schema: "public" })
export class MeasurementParameter {
  @ApiProperty({
    example: 'Heart Rate',
    description: 'The unique name of the measurement parameter',
  })
  @PrimaryColumn({type: "varchar", name: "name", length: 255 })
  name: string;

  @ManyToMany(() => Exercise, (exercise) => exercise.measurementParameters)
  exercises: Exercise[];
}
