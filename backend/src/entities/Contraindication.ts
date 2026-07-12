import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Exercise } from "./Exercise";
import { ClinicalProfile } from "./ClinicalProfile";
import { ApiProperty } from "@nestjs/swagger";

@Index("contraindication_pkey", ["name"], { unique: true })
@Entity("contraindication", { schema: "public" })
export class Contraindication {
    @ApiProperty({ example: "Neuropatía periférica" })
    @PrimaryColumn({ type: "varchar", name: "name", length: 255 })
    name: string;

    @ApiProperty({ nullable: true, example: "Afecta equilibrio y motricidad fina; frecuente por vincristina" })
    @Column({ type: "text", name: "description", nullable: true })
    description: string | null;

    @ManyToMany(() => Exercise, (exercise) => exercise.contraindications)
    @JoinTable({
        name: "restricts",
        joinColumns: [{ name: "contraindication", referencedColumnName: "name" }],
        inverseJoinColumns: [{ name: "exercise", referencedColumnName: "name" }],
        schema: "public",
    })
    exercises: Exercise[];

    @ManyToMany(() => ClinicalProfile, (profile) => profile.contraindications)
    clinicalProfiles: ClinicalProfile[];
}