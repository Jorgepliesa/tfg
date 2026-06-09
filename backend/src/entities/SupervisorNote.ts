import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ClinicalProfile } from "./ClinicalProfile";
import { ApiProperty } from "@nestjs/swagger";

@Index("supervisor_note_pkey", ["clinicalProfile", "date"], { unique: true })
@Entity("supervisor_note", { schema: "public" })
export class SupervisorNote {
    @ApiProperty({ example: 821011 })
    @PrimaryColumn({ type: "integer", name: "clinical_profile" })
    clinicalProfile: number;

    @ApiProperty({ example: '2026-06-09T13:00:00Z' })
    @PrimaryColumn({
        type: "timestamp with time zone",
        name: "date",
        default: () => "CURRENT_TIMESTAMP",
    })
    date: Date;

    @ApiProperty({ example: 'Tuvo náuseas después de la sesión' })
    @Column({ type: "text", name: "content" })
    content: string;

    @ManyToOne(() => ClinicalProfile)
    @JoinColumn({ name: "clinical_profile", referencedColumnName: "id" })
    clinicalProfileEntity: ClinicalProfile;
}