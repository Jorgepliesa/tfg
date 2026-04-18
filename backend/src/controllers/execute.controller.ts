import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';
import { ExecuteService } from '../services/execute.service';
import { SessionService } from '../services/session.service';
import { ExecuteCreateDto, ExecuteResponseDto, ExecuteSessionListDto } from '../dtos/execute.dto';
import type { Request } from 'express';

@ApiTags('Exercises Execution')
@Controller('execute')
export class ExecuteController {
  constructor(
    private executeService: ExecuteService,
    private sessionService: SessionService,
  ) {}

  /**
   * POST /execute/create
   * Save an executed exercise during a session
   * Automatically uses the user's active session
   */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: ExecuteCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Exercise execution recorded',
    type: ExecuteResponseDto,
  })
  async createExecute(
    @Req() req: Request,
    @Body() createExecuteDto: ExecuteCreateDto,
  ): Promise<ExecuteResponseDto> {
    // Get the user's active session
    const userId = (req.user as any).id;
    const activeSession = await this.sessionService.getActiveSession(userId);
    
    return this.executeService.createExecute(
      activeSession.date,
      userId,
      createExecuteDto,
    );
  }

  /**
   * GET /execute/session/:sessionDate
   * Get all exercises executed in a specific session
   */
  @Get('session/:sessionDate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'List of all exercises executed in session',
    type: ExecuteSessionListDto,
  })
  async getSessionExecutes(
    @Req() req: Request,
    @Param('sessionDate') sessionDate: string,
  ): Promise<ExecuteSessionListDto> {
    const date = new Date(sessionDate);
    return this.executeService.getSessionExecutes(date, (req.user as any).id);
  }

  /**
   * GET /execute/:exerciseName
   * Get a specific exercise execution
   */
  @Get(':exerciseName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Exercise execution details',
    type: ExecuteResponseDto,
  })
  async getExecute(
    @Req() req: Request,
    @Param('exerciseName') exerciseName: string,
  ): Promise<ExecuteResponseDto> {
    const now = new Date();
    return this.executeService.getExecute(now, (req.user as any).id, exerciseName);
  }
}
