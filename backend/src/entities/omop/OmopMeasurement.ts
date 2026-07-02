// entities/omop/OmopMeasurement.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'measurement', schema: 'omop_modified' })
export class OmopMeasurement {
    @PrimaryColumn({ name: 'measurement_id' })
    measurementId: number;

    @Column({ name: 'person_id' })
    personId: number;

    @Column({ name: 'measurement_concept_id' })
    measurementConceptId: number;

    @Column({ type: 'timestamptz', name: 'measurement_datetime' })
    measurementDatetime: Date;

    @Column({ type: 'float', name: 'value_as_number', nullable: true })
    valueAsNumber: number | null;

    @Column({ name: 'measurement_source_value', nullable: true })
    measurementSourceValue: string | null;

    @Column({ name: 'unit_source_value', nullable: true })
    unitSourceValue: string | null;
}