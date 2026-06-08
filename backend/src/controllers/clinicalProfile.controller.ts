import {
    Controller, Get, Post, Patch, Body,
    Req, UseGuards, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';
import { ClinicalProfileService } from '../services/clinicalProfile.service';
import { ClinicalProfileCreateDto, ClinicalProfileUpdateDto } from '../dtos/clinicalProfile.dto';
import type { Request } from 'express';

@ApiTags('Clinical Profile')
@Controller('clinical-profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ClinicalProfileController {
    constructor(private service: ClinicalProfileService) { }

    @Get()
    async getProfile(@Req() req: Request) {
        return this.service.getProfile(req.user!.id);
    }

    @Post()
    async createProfile(@Req() req: Request, @Body() dto: ClinicalProfileCreateDto) {
        return this.service.createOrUpdateProfile(req.user!.id, dto);
    }

    @Patch()
    async updateProfile(@Req() req: Request, @Body() dto: ClinicalProfileUpdateDto) {
        return this.service.createOrUpdateProfile(req.user!.id, dto);
    }

    @Get('dashboard')
    async getDashboard(@Req() req: Request) {
        const userId = req.user!.id;
        const [profile, stats, steps, sessions, wellness] = await Promise.all([
            this.service.getProfile(userId),
            this.service.getDashboardStats(userId),
            this.service.getRecentSteps(userId, 14),
            this.service.getSessionsByCategory(userId),
            this.service.getWellnessAverage(userId),
        ]);

        return { profile, stats, steps, sessions, wellness };
    }

    @Get('steps')
    @ApiQuery({ name: 'days', required: false, type: Number })
    async getSteps(@Req() req: Request, @Query('days') days?: number) {
        return this.service.getRecentSteps(req.user!.id, days ?? 14);
    }
}