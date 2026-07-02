// entities/omop/OmopDailySummary.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'daily_summary', schema: 'custom' })
export class OmopDailySummary {
    @PrimaryColumn({ type: 'date' })
    date: Date;

    @PrimaryColumn({ name: 'person_id' })
    personId: number;

    @Column({ nullable: true }) steps: number | null;
    @Column({ name: 'min_hr_bpm', nullable: true }) minHrBpm: number | null;
    @Column({ name: 'max_hr_bpm', nullable: true }) maxHrBpm: number | null;
    @Column({ name: 'avg_hr_bpm', nullable: true }) avgHrBpm: number | null;
    @Column({ name: 'sleep_duration_minutes', nullable: true }) sleepDurationMinutes: number | null;
    @Column({ name: 'min_rr_bpm', nullable: true }) minRrBpm: number | null;
    @Column({ name: 'max_rr_bpm', nullable: true }) maxRrBpm: number | null;
    @Column({ type: 'float', name: 'spo2_avg', nullable: true }) spo2Avg: number | null;
}