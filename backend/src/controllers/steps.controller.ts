import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { JwtAuthGuard } from "../utils/jwt-auth.guard";
import { StepsService } from "../services/steps.service";

@ApiTags('Steps')
@Controller('steps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StepsController {
    constructor(private stepsService: StepsService) {}

    @Get('numSteps')
    @ApiOperation({ summary: 'Get num of steps for today' })
    @ApiResponse({ 
        status: 200, 
        description: 'Number of steps retrieved successfully',
        schema: { 
            example: {date:'2026-03-15', userId: 821011, numSteps: 150 }
        }
    })
    @ApiResponse({ status: 404, description: 'Steps not found' })
    async getNumSteps(@Req() req: Request) {
        const userId = req.user!.id; // El ! indica que user existe (validado por JwtAuthGuard)
        const today = new Date();
        const numSteps = await this.stepsService.getNumSteps(userId, today);
        return {date: today, userId, numSteps };
    }

}