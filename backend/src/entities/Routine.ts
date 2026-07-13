import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Plan } from "./Plan";
import { ApiProperty } from "@nestjs/swagger";
import { UserAccount } from "./UserAccount";

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
  @PrimaryColumn({ type: "varchar", name: "name", length: 255 })
  name: string;

  @ApiProperty({
    example: 'aerobic',
    description: 'Primary category of the routine',
  })
  @Column({ type: "enum", name: "category", enum: Category })
  category: Category;

  @ApiProperty({
    example: 'easy',
    description: 'Overall difficulty of the routine',
  })
  @Column({ type: "enum", name: "difficulty", enum: Difficulty })
  difficulty: Difficulty;

  @ApiProperty({
    nullable: true,
    example: 821011,
    description: "Si tiene valor, esta rutina fue diseñada por un profesional específicamente para este usuario; si es null, es una rutina genérica de librería",
  })
  @Column({ type: "integer", name: "assigned_user_id", nullable: true })
  assignedUserId: number | null;

  @ManyToOne(() => UserAccount, { nullable: true })
  @JoinColumn([{ name: "assigned_user_id", referencedColumnName: "id" }])
  assignedUser: UserAccount | null;

  @OneToMany(() => Plan, (plan) => plan.routineEntity)
  plans: Plan[];
}
