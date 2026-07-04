// entities/omop/OmopMeasurement.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'measurement', schema: 'omop_modified' })
export class OmopMeasurement {
    @PrimaryGeneratedColumn({ name: 'measurement_id' })
    measurementId: number;

    @Column({ type: 'integer', name: 'person_id' })
    personId: number;

    @Column({ type: 'integer', name: 'measurement_concept_id' })
    measurementConceptId: number;

    @Column({ type: 'date', name: 'measurement_date' })
    measurementDate: string;

    @Column({ type: 'timestamptz', name: 'measurement_datetime', nullable: true })
    measurementDatetime: Date | null;

    @Column({ type: 'integer', name: 'measurement_type_concept_id', nullable: true })
    measurementTypeConceptId: number | null;

    @Column({ type: 'numeric', name: 'value_as_number', nullable: true })
    valueAsNumber: number | null;

    @Column({ type: 'integer', name: 'unit_concept_id', nullable: true })
    unitConceptId: number | null;

    @Column({ type: 'numeric', name: 'range_low', nullable: true })
    rangeLow: number | null;

    @Column({ type: 'numeric', name: 'range_high', nullable: true })
    rangeHigh: number | null;

    @Column({ type: 'varchar', name: 'measurement_source_value', nullable: true })
    measurementSourceValue: string | null;

    @Column({ type: 'varchar', name: 'unit_source_value', nullable: true })
    unitSourceValue: string | null;
}