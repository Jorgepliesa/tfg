import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Audiovisual } from "./Audiovisual";
import { Execute } from "./Execute";
import { Equipment } from "./Equipment";
import { Plan } from "./Plan";
import { MuscleGroup } from "./MuscleGroup";
import { MeasurementParameter } from "./MeasurementParameter";

export enum ExerciseCategory {
  AEROBIC = "aerobic",
  STRENGTH = "strength",
  FLEXIBILITY = "flexibility",
  BALANCE = "balance",
}

export enum ExerciseDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

@Index("exercise_pkey", ["name"], { unique: true })
@Entity("exercise", { schema: "public" })
export class Exercise {

  @PrimaryColumn({type: "varchar", name: "name", length: 255 })
  name: string;

  @Column({type: "text", name: "description" })
  description: string;

  @Column({type: "enum", name: "category", enum: ExerciseCategory })
  category: ExerciseCategory;

  @Column({type: "enum", name: "difficulty", enum: ExerciseDifficulty })
  difficulty: ExerciseDifficulty;

  @ManyToMany(() => Audiovisual, (audiovisual) => audiovisual.exercises)
  audiovisuals: Audiovisual[];

  @ManyToMany(() => Equipment, (equipment) => equipment.exercises)
  @JoinTable({
    name: "need",
    joinColumns: [{ name: "exercise", referencedColumnName: "name" }],
    inverseJoinColumns: [{ name: "equipment", referencedColumnName: "name" }],
    schema: "public",
  })
  equipment: Equipment[];

  @OneToMany(() => Plan, (plan) => plan.exerciseEntity)
  plans: Plan[];

  @ManyToMany(() => MuscleGroup, (muscleGroup) => muscleGroup.exercises)
  @JoinTable({
    name: "train",
    joinColumns: [{ name: "exercise", referencedColumnName: "name" }],
    inverseJoinColumns: [
      { name: "muscle_group", referencedColumnName: "name" },
    ],
    schema: "public",
  })
  muscleGroups: MuscleGroup[];

  @ManyToMany(
    () => MeasurementParameter,
    (measurementParameter) => measurementParameter.exercises
  )
  @JoinTable({
    name: "use",
    joinColumns: [{ name: "exercise", referencedColumnName: "name" }],
    inverseJoinColumns: [
      { name: "measure_param", referencedColumnName: "name" },
    ],
    schema: "public",
  })
  measurementParameters: MeasurementParameter[];
}
