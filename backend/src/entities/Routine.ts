import { Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { Plan } from "./Plan";
import { ApiProperty } from "@nestjs/swagger";

@Index("routine_pkey", ["name"], { unique: true })
@Entity("routine", { schema: "public" })
export class Routine {
  @ApiProperty({
    example: 'Rutina de fuerza',
    description: 'The unique name of the routine',
  })
  @PrimaryColumn({type: "varchar", name: "name", length: 255 })
  name: string;

  @OneToMany(() => Plan, (plan) => plan.routine)
  plans: Plan[];
}
