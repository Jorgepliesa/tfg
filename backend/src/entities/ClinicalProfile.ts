import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CoopChallenge } from "./CoopChallenge";
import { Keep } from "./Keep";
import { UserAccount } from "./UserAccount";
import { ApiProperty } from "@nestjs/swagger";
import { Complete } from "./Complete";

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

@Index("clinical_profile_pkey", ["id"], { unique: true })
@Entity("clinical_profile", { schema: "public" })
export class ClinicalProfile {
  @ApiProperty({
    description: "Unique identifier for the clinical profile",
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @ApiProperty({
    description: "Age of the patient",
    example: 25,
  })
  @Column("integer", { name: "age" })
  age: number;

  @ApiProperty({
    description: "Gender of the patient",
    example: 'male',
  })
  @Column("enum", { name: "gender", enum: Gender })
  gender: Gender;

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
    description: "Birth date of the patient",
    example: '2000-01-01',
  })
  @Column("date", { name: "birthDate" })
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
  @Column("date", { name: "treatmentEndDate" })
  treatmentEndDate: Date;

  @ApiProperty({
    description: "Hospital of the patient",
    example: 'Hospital General',
  })
  @Column("varchar", { name: "hospital" })
  hospital: string;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.clinicalProfile)
  @JoinColumn({ name: "user_id", referencedColumnName: "clinical_profile" }) // Es necesario? 
  userAccount: UserAccount;
}