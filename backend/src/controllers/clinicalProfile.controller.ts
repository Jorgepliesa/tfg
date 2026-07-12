import {
    Controller, Get, Post, Patch, Body,
    Req, UseGuards, Query,
    Delete,
    Param,
    BadRequestException,
    Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
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
        const [profile, stats, steps, sessions, wellness, adherence, notes] = await Promise.all([
            this.service.getProfile(userId),
            this.service.getDashboardStats(userId),
            this.service.getRecentSteps(userId, 14),
            this.service.getSessionsByCategory(userId),
            this.service.getWellnessAverage(userId),
            this.service.getAdherence(userId),
            this.service.getNotes(userId),
        ]);

        return { profile, stats, steps, sessions, wellness, adherence, notes };
    }

    @Get('steps')
    @ApiQuery({ name: 'days', required: false, type: Number })
    async getSteps(@Req() req: Request, @Query('days') days?: number) {
        return this.service.getRecentSteps(req.user!.id, days ?? 14);
    }

    @Get('notes')
    async getNotes(@Req() req: Request) {
        return this.service.getNotes(req.user!.id);
    }

    @Post('notes')
    async addNote(@Req() req: Request, @Body('content') content: string) {
        if (!content?.trim()) throw new BadRequestException('Content is required');
        return this.service.addNote(req.user!.id, content.trim());
    }

    @Delete('notes/:date')
    async deleteNote(@Req() req: Request, @Param('date') date: string) {
        return this.service.deleteNote(req.user!.id, date);
    }

    @Get('contraindications/catalog')
    async getContraindicationCatalog() {
        return this.service.getContraindicationCatalog();
    }

    @Get('contraindications')
    async getContraindications(@Req() req: Request) {
        return this.service.getUserContraindications(req.user!.id);
    }

    @Put('contraindications')
    @ApiBody({ schema: { example: { names: ['Neuropatía'] } } })
    async setContraindications(@Req() req: Request, @Body('names') names: string[]) {
        return this.service.setContraindications(req.user!.id, names ?? []);
    }
}