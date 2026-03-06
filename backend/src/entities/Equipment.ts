import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Exercise } from "./Exercise";
import { ApiProperty } from "@nestjs/swagger";

@Index("equipment_pkey", ["name"], { unique: true })
@Entity("equipment", { schema: "public" })
export class Equipment {
  @ApiProperty({
    example: 'Weights',
    description: 'The unique name of the equipment',
  })
  @PrimaryColumn({type: "varchar", name: "name", length: 255 })
  name: string;

  @ManyToMany(() => Exercise, (exercise) => exercise.equipment)
  @JoinTable({
    name: "need",
    joinColumns: [{ name: "equipment", referencedColumnName: "name" }],
    inverseJoinColumns: [{ name: "exercise", referencedColumnName: "name" }],
    schema: "public",
  })
  exercises: Exercise[];
}
