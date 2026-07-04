// entities/omop/OmopDailySummary.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'daily_summary', schema: 'custom' })
export class OmopDailySummary {
    @PrimaryColumn({ type: 'date', name: 'date' })
    date: string;

    @PrimaryColumn({ type: 'integer', name: 'person_id' })
    personId: number;

    @Column({ type: 'integer', nullable: true })
    steps: number | null;

    @Column({ type: 'numeric', name: 'min_hr_bpm', nullable: true })
    minHrBpm: number | null;

    @Column({ type: 'numeric', name: 'max_hr_bpm', nullable: true })
    maxHrBpm: number | null;

    @Column({ type: 'numeric', name: 'avg_hr_bpm', nullable: true })
    avgHrBpm: number | null;

    @Column({ type: 'integer', name: 'sleep_duration_minutes', nullable: true })
    sleepDurationMinutes: number | null;

    @Column({ type: 'numeric', name: 'min_rr_bpm', nullable: true })
    minRrBpm: number | null;

    @Column({ type: 'numeric', name: 'max_rr_bpm', nullable: true })
    maxRrBpm: number | null;

    @Column({ type: 'numeric', name: 'spo2_avg', nullable: true })
    spo2Avg: number | null;

    @Column({ type: 'jsonb', nullable: true, default: '{}' })
    summary: object | null;
}