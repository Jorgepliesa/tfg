// controllers/omop-sensor.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';
import { ClinicalProfileService } from '../services/clinicalProfile.service';
import type { Request } from 'express';
import { OmopSensorService } from '../services/omopSensor.service';
import { SessionService } from '../services/session.service';

@ApiTags('Sensor Data')
@Controller('sensors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OmopSensorController {
    constructor(
        private omopSensorService: OmopSensorService,
        private clinicalProfileService: ClinicalProfileService,
        private sessionService: SessionService,
    ) { }

    private async getOmopPersonId(userId: number): Promise<number | null> {
        const profile = await this.clinicalProfileService.getProfile(userId);
        return profile?.omopPersonId ?? null;
    }

    @Get('session')
    @ApiQuery({ name: 'start', type: String, description: 'ISO datetime' })
    @ApiQuery({ name: 'end', type: String, description: 'ISO datetime' })
    async getSessionData(
        @Req() req: Request,
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const omopPersonId = await this.getOmopPersonId(req.user!.id);
        if (!omopPersonId) return { error: 'No hay dispositivo wearable vinculado a este usuario' };
        return this.omopSensorService.getSessionSensorData(omopPersonId, new Date(start), new Date(end));
    }

    @Get('daily')
    @ApiQuery({ name: 'days', required: false, type: Number })
    async getDailySummary(
        @Req() req: Request,
        @Query('days') days?: number,
    ) {
        const omopPersonId = await this.getOmopPersonId(req.user!.id);
        if (!omopPersonId) return [];
        return this.omopSensorService.getDailySummaries(omopPersonId, days ?? 14);
    }

    @Get('today-steps')
    @ApiOperation({ summary: 'Pasos totales de hoy, calculados en tiempo real desde las mediciones OMOP' })
    @ApiResponse({ status: 200, schema: { example: { todaySteps: 4230 } } })
    async getTodaySteps(@Req() req: Request) {
        const omopPersonId = await this.getOmopPersonId(req.user!.id);
        if (!omopPersonId) return { todaySteps: 0 };
        const todaySteps = await this.omopSensorService.getTodaySteps(omopPersonId);
        return { todaySteps };
    }

    @Get('recent-sessions-summary')
    @ApiOperation({ summary: 'Resumen de frecuencia cardiaca/SpO2 durante las últimas sesiones de entrenamiento' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getRecentSessionsSummary(@Req() req: Request, @Query('limit') limit?: number) {
        const omopPersonId = await this.getOmopPersonId(req.user!.id);
        if (!omopPersonId) return [];

        const sessions = await this.sessionService.getRecentSessions(req.user!.id, limit ?? 10);

        return Promise.all(
            sessions.map(async (s) => {
                const start = new Date(s.date);
                const end = new Date(start.getTime() + s.duration * 60000);
                const sensorSummary = await this.omopSensorService.getSessionSummary(omopPersonId, start, end);
                return { date: s.date, routine: s.routine, durationMinutes: s.duration, ...sensorSummary };
            }),
        );
    }
}