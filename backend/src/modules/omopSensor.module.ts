// modules/omop-sensor.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OmopMeasurement } from '../entities/omop/OmopMeasurement';
import { OmopDailySummary } from '../entities/omop/OmopDailySummary';
import { OmopSensorController } from '../controllers/omopSensor.controller';
import { OmopSensorService } from '../services/omopSensor.service';
import { ClinicalProfileModule } from './clinicalProfile.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([OmopMeasurement, OmopDailySummary], 'omop'),
        ClinicalProfileModule,
    ],
    controllers: [OmopSensorController],
    providers: [OmopSensorService],
    exports: [OmopSensorService],
})
export class OmopSensorModule { }