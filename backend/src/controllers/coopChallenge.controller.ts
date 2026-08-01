import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../utils/jwt-auth.guard";
import { ChallengeService } from "../services/coopChallenge.service";
import { isDefined } from "class-validator";

@ApiTags('CoopChallenge')
@Controller('challenges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CoopChallengeController {
    constructor(private challengeService: ChallengeService) { }

    @Get('active')
    @ApiOperation({ summary: 'Get active cooperative challenge with current progress' })
    @ApiResponse({
        status: 200,
        description: 'Active challenge retrieved successfully',
        schema: {
            example: {
                name: 'El Dragón del Sedentarismo',
                startDate: '2026-06-05T00:00:00Z',
                endDate: '2026-06-12T00:00:00Z',
                totalSteps: 100000,
                currentSteps: 15400,
                memorial: 'El Corazón en Forma',
                isDefeated: false,
            }
        }
    })
    async getActiveChallenge() {
        return await this.challengeService.getActiveChallenge();
    }
}
