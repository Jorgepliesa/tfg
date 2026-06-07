import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';
import { MemorialService } from '../services/memorial.service';
import type { Request } from 'express';

@ApiTags('Memorials')
@Controller('memorial')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MemorialController {
    constructor(private memorialService: MemorialService) {}

    @Get()
    @ApiResponse({ status: 200, description: 'All memorials with unlock status' })
    async getMemorials(@Req() req: Request) {
        // Construye la base URL (ej: http://192.168.0.32:3000)
        const host = req.get('host');
        const protocol = req.protocol;
        const baseUrl = `${protocol}://${host}`;
        
        return this.memorialService.getMemorialsWithStatus(req.user!.id, baseUrl);
    }
}