// services/omop-sensor.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OmopMeasurement } from '../entities/omop/OmopMeasurement';
import { OmopDailySummary } from '../entities/omop/OmopDailySummary';

// Concept IDs del vocabulario OMOP
const CONCEPT = {
    HEART_RATE: 3027018,
    STEPS: 40758552,
    RESP_RATE: 3024171,
    SPO2: 40762499,
    SLEEP: 1002368,
};

@Injectable()
export class OmopSensorService {
    constructor(
        @InjectRepository(OmopMeasurement, 'omop')
        private measurementRepo: Repository<OmopMeasurement>,

        @InjectRepository(OmopDailySummary, 'omop')
        private dailySummaryRepo: Repository<OmopDailySummary>,
    ) { }

    // Datos de una sesión de ejercicio por rango de fechas
    async getSessionSensorData(
        externalPersonId: number,
        startTime: Date,
        endTime: Date,
    ) {
        const base = {
            personId: externalPersonId,
            measurementDatetime: Between(startTime, endTime),
        };

        const [heartRate, steps, respRate, spo2] = await Promise.all([
            this.measurementRepo.find({
                where: { ...base, measurementConceptId: CONCEPT.HEART_RATE },
                order: { measurementDatetime: 'ASC' },
            }),
            this.measurementRepo.find({
                where: { ...base, measurementConceptId: CONCEPT.STEPS },
                order: { measurementDatetime: 'ASC' },
            }),
            this.measurementRepo.find({
                where: { ...base, measurementConceptId: CONCEPT.RESP_RATE },
                order: { measurementDatetime: 'ASC' },
            }),
            this.measurementRepo.find({
                where: { ...base, measurementConceptId: CONCEPT.SPO2 },
                order: { measurementDatetime: 'ASC' },
            }),
        ]);

        return {
            period: { start: startTime, end: endTime },
            heartRate: heartRate.map(m => ({
                timestamp: m.measurementDatetime,
                value: m.valueAsNumber,
                unit: m.unitSourceValue,
            })),
            steps: steps.map(m => ({
                timestamp: m.measurementDatetime,
                value: m.valueAsNumber,
            })),
            respiratoryRate: respRate.map(m => ({
                timestamp: m.measurementDatetime,
                value: m.valueAsNumber,
                unit: m.unitSourceValue,
            })),
            spo2: spo2.map(m => ({
                timestamp: m.measurementDatetime,
                value: m.valueAsNumber,
                unit: m.unitSourceValue,
            })),
        };
    }

    // Resumen diario (para el dashboard parental)
    async getDailySummaries(
        externalPersonId: number,
        days: number = 14,
    ): Promise<OmopDailySummary[]> {
        const from = new Date();
        from.setDate(from.getDate() - days);
        from.setHours(0, 0, 0, 0);

        return this.dailySummaryRepo.find({
            where: {
                personId: externalPersonId,
                date: Between(from as any, new Date() as any),
            },
            order: { date: 'ASC' },
        });
    }

    // Para obtener los pasos diarios
    async getTodaySteps(personId: number): Promise<number> {
        const todayStr = new Date().toISOString().slice(0, 10);
        const result = await this.measurementRepo.createQueryBuilder('m')
            .select('SUM(m.value_as_number)', 'total')
            .where('m.person_id = :personId', { personId })
            .andWhere('m.measurement_concept_id = :conceptId', { conceptId: CONCEPT.STEPS })
            .andWhere('m.measurement_date = :today', { today: todayStr })
            .getRawOne();

        return Math.round(Number(result?.total) || 0);
    }

    // Para que quiero esto?
    async getSessionSummary(personId: number, startTime: Date, endTime: Date) {
        const [hrStats, spo2Stats, stepsStats] = await Promise.all([
            this.measurementRepo.createQueryBuilder('m')
                .select('AVG(m.value_as_number)', 'avg')
                .addSelect('MAX(m.value_as_number)', 'max')
                .addSelect('MIN(m.value_as_number)', 'min')
                .addSelect('COUNT(*)', 'count')
                .where('m.person_id = :personId', { personId })
                .andWhere('m.measurement_concept_id = :conceptId', { conceptId: CONCEPT.HEART_RATE })
                .andWhere('m.measurement_datetime BETWEEN :start AND :end', { start: startTime, end: endTime })
                .getRawOne(),
            this.measurementRepo.createQueryBuilder('m')
                .select('AVG(m.value_as_number)', 'avg')
                .addSelect('MIN(m.value_as_number)', 'min')
                .where('m.person_id = :personId', { personId })
                .andWhere('m.measurement_concept_id = :conceptId', { conceptId: CONCEPT.SPO2 })
                .andWhere('m.measurement_datetime BETWEEN :start AND :end', { start: startTime, end: endTime })
                .getRawOne(),
            this.measurementRepo.createQueryBuilder('m')
                .select('SUM(m.value_as_number)', 'total')
                .where('m.person_id = :personId', { personId })
                .andWhere('m.measurement_concept_id = :conceptId', { conceptId: CONCEPT.STEPS })
                .andWhere('m.measurement_datetime BETWEEN :start AND :end', { start: startTime, end: endTime })
                .getRawOne(),
        ]);

        return {
            avgHeartRate: hrStats?.avg ? Math.round(Number(hrStats.avg)) : null,
            maxHeartRate: hrStats?.max ? Math.round(Number(hrStats.max)) : null,
            minHeartRate: hrStats?.min ? Math.round(Number(hrStats.min)) : null,
            sampleCount: hrStats?.count ? Number(hrStats.count) : 0,
            avgSpo2: spo2Stats?.avg ? Math.round(Number(spo2Stats.avg)) : null,
            minSpo2: spo2Stats?.min ? Math.round(Number(spo2Stats.min)) : null,
            stepsDuringSession: stepsStats?.total ? Math.round(Number(stepsStats.total)) : 0,
        };
    }
}