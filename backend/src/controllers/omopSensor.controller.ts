// controllers/omop-sensor.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';
import { ClinicalProfileService } from '../services/clinicalProfile.service';
import type { Request } from 'express';
import { OmopSensorService } from '../services/omopSensor.service';

@ApiTags('Sensor Data')
@Controller('sensors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OmopSensorController {
    constructor(
        private omopSensorService: OmopSensorService,
        private clinicalProfileService: ClinicalProfileService,
    ) { }

    @Get('session')
    @ApiQuery({ name: 'start', type: String, description: 'ISO datetime' })
    @ApiQuery({ name: 'end', type: String, description: 'ISO datetime' })
    async getSessionData(
        @Req() req: Request,
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const profile = await this.clinicalProfileService.getProfile(req.user!.id);
        if (!profile?.id) {
            return { error: 'No hay dispositivo wearable vinculado a este usuario' };
        }
        return this.omopSensorService.getSessionSensorData(
            profile.id,
            new Date(start),
            new Date(end),
        );
    }

    @Get('daily')
    @ApiQuery({ name: 'days', required: false, type: Number })
    async getDailySummary(
        @Req() req: Request,
        @Query('days') days?: number,
    ) {
        const profile = await this.clinicalProfileService.getProfile(req.user!.id);
        if (!profile?.id) {
            return [];
        }
        return this.omopSensorService.getDailySummaries(
            profile.id,
            days ?? 14,
        );
    }
}