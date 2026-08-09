import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CoopChallenge } from "./CoopChallenge";
import { Keep } from "./Keep";
import { UserAccount } from "./UserAccount";
import { ApiProperty } from "@nestjs/swagger";
import { Complete } from "./Complete";
import { Contraindication } from "./Contraindication";

export enum BiologicalSex {
  MALE = "male",
  FEMALE = "female",
}

export enum TannerStage {
  I = "I",
  II = "II",
  III = "III",
  IV = "IV",
  V = "V",
}

@Index("clinical_profile_pkey", ["id"], { unique: true })
@Entity("clinical_profile", { schema: "public" })
export class ClinicalProfile {
  @ApiProperty({
    description: "Unique identifier for the clinical profile",
    example: 1,
  })
  @PrimaryColumn({ type: "integer", name: "id" })
  id: number;

  @ApiProperty({
    description: "Age of the patient",
    example: 25,
  })
  @Column("integer", { name: "age" })
  age: number;

  @ApiProperty({
    description: "Biological sex of the patient",
    example: 'male',
  })
  @Column("enum", { name: "biological_sex", enum: BiologicalSex })
  biologicalSex: BiologicalSex;

  @ApiProperty({
    description: "Estadio de Tanner determinado por el médico",
    enum: TannerStage,
    example: TannerStage.II,
    nullable: true,
  })
  @Column("enum", {
    name: "tanner_stage",
    enum: TannerStage,
    nullable: true,
  })
  tannerStage: TannerStage;

  @ApiProperty({
    description: "Height of the patient",
    example: 175,
  })
  @Column("integer", { name: "height" })
  height: number;

  @ApiProperty({
    description: "Weight of the patient",
    example: 70,
  })
  @Column("integer", { name: "weight" })
  weight: number;

  @ApiProperty({
    description: "Índice de Masa Corporal (IMC), calculado o registrado",
    example: 18.4,
    nullable: true,
  })
  @Column("numeric", { name: "bmi", nullable: true })
  bmi: number;

  @ApiProperty({
    description: "Percentil de IMC según tablas de referencia pediátricas",
    example: 65,
    nullable: true,
  })
  @Column("numeric", { name: "bmi_percentile", nullable: true })
  bmiPercentile: number;

  @ApiProperty({
    description: "Enfermedades o patologías previas al diagnóstico del cáncer",
    example: "Asma infantil leve",
    nullable: true,
  })
  @Column("text", { name: "prior_conditions", nullable: true })
  priorConditions: string | null;

  @ApiProperty({
    description: "Comorbilidades actuales no relacionadas con el cáncer",
    example: "Ninguna conocida",
    nullable: true,
  })
  @Column("text", { name: "current_comorbidities", nullable: true })
  currentComorbidities: string | null;

  @ApiProperty({
    description:
      "Antecedentes familiares relevantes (cardiovasculares, metabólicos, oncológicos)",
    example: "Abuelo materno con diabetes tipo 2",
    nullable: true,
  })
  @Column("text", { name: "family_history", nullable: true })
  familyHistory: string | null;

  @ApiProperty({
    description: "Birth date of the patient",
    example: '2000-01-01',
  })
  @Column("date", { name: "birth_date" })
  birthDate: Date;

  @ApiProperty({
    description: "Diagnosis of the patient",
    example: 'Diabetes',
  })
  @Column("varchar", { name: "diagnosis" })
  diagnosis: string;

  @ApiProperty({
    description: "Treatment end date of the patient",
    example: '2025-01-01',
  })
  @Column("date", { name: "treatment_end_date" })
  treatmentEndDate: Date;

  @ApiProperty({
    description: "Hospital of the patient",
    example: 'Hospital General',
  })
  @Column("varchar", { name: "hospital" })
  hospital: string;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.clinicalProfileEntity)
  @JoinColumn({ name: "id", referencedColumnName: "id" })
  userAccount: UserAccount;

  @ApiProperty({ type: [String], description: "Contraindicaciones que presenta el paciente" })
  @ManyToMany(() => Contraindication, (c) => c.clinicalProfiles)
  @JoinTable({
    name: "presents",
    joinColumns: [{ name: "clinical_profile", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "contraindication", referencedColumnName: "name" }],
    schema: "public",
  })
  contraindications: Contraindication[];
}