import { Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { Plan } from "./Plan";
import { ApiProperty } from "@nestjs/swagger";

export enum Category {
  AEROBIC = "aerobic",
  STRENGTH = "strength",
  FLEXIBILITY = "flexibility",
  BALANCE = "balance",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

@Index("routine_pkey", ["name"], { unique: true })
@Entity("routine", { schema: "public" })
export class Routine {
  @ApiProperty({
    example: 'Rutina de fuerza',
    description: 'The unique name of the routine',
  })
  @PrimaryColumn({type: "varchar", name: "name", length: 255 })
  name: string;

  @ApiProperty({
    example: 'aerobic',
    description: 'Primary category of the routine',
  })
  @Column({type: "enum", name: "category", enum: Category })
  category: Category;

  @ApiProperty({
    example: 'easy',
    description: 'Overall difficulty of the routine',
  })
  @Column({type: "enum", name: "difficulty", enum: Difficulty })
  difficulty: Difficulty;

  @OneToMany(() => Plan, (plan) => plan.routine)
  plans: Plan[];
}
