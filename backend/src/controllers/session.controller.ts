import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from "@nestjs/swagger";
import { JwtAuthGuard } from "../utils/jwt-auth.guard";
import { SessionService } from "../services/session.service";
import type { Request } from "express";
import { SessionCreateDto, SessionUpdateDto, SessionResponseDto } from "../dtos/session.dto";

@ApiTags('Session')
@Controller('session')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SessionController {
    constructor(private sessionService: SessionService) {}
 
    @Get('can-start')
    @ApiResponse({
        status: 200,
        description: 'Check if the user can start a new session today',
    })
    async canStartSession(@Req() req: Request): Promise<{ canStart: boolean }> {
        return { canStart: await this.sessionService.canStartSession(req.user!.id) };
    }

    @Post('start')
    @ApiBody({ type: SessionCreateDto })
    @ApiResponse({
        status: 201,
        description: 'Session started successfully',
        type: SessionResponseDto,
    })
    async startSession(@Req() req: Request, @Body() createSessionDto: SessionCreateDto): Promise<SessionResponseDto> {
        return this.sessionService.startSession(req.user!.id, createSessionDto);
    }

    @Get('current')
    @ApiResponse({
        status: 200,
        description: 'Current active session retrieved',
        type: SessionResponseDto,
    })
    async getCurrentSession(@Req() req: Request): Promise<SessionResponseDto> {
        return this.sessionService.getActiveSession(req.user!.id);
    }

    @Patch('end')
    @ApiBody({ type: SessionUpdateDto })
    @ApiResponse({
        status: 200,
        description: 'Session ended successfully',
        type: SessionResponseDto,
    })
    async endSession(
        @Req() req: Request,
        @Body() updateSessionDto: SessionUpdateDto,
    ): Promise<SessionResponseDto> {
        return this.sessionService.endSession(req.user!.id, updateSessionDto.duration);
    }
}