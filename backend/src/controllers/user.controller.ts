import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { JwtAuthGuard } from "../utils/jwt-auth.guard";
import { UserService } from "../services/user.service";

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('profile')
    @ApiOperation({ summary: 'Get user profile with today steps' })
    @ApiResponse({ 
        status: 200, 
        description: 'User profile retrieved',
        schema: { example: { id: 821011, streak: 7 } }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getProfile(@Req() req: Request) {
        const userId = req.user!.id;
        return await this.userService.getUserProfile(userId);
    }

    @Get('fp')
    @ApiOperation({ summary: 'Get current fitness points of the avatar' })
    @ApiResponse({ 
        status: 200, 
        description: 'Fitness Points retrieved successfully',
        schema: { 
            example: { avatar: 1, fp: 100 }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Avatar not found' })
    async getFitnessPoints(@Req() req: Request) {
        const userId = req.user!.id; // El ! indica que user existe (validado por JwtAuthGuard)
        const fp = await this.userService.getFitnessPoints(userId);
        return { userId, fp };
    }

    @Get('today-steps')
    @ApiOperation({ summary: 'Get today\'s steps for the user' })
    @ApiResponse({ 
        status: 200, 
        description: 'Today\'s steps retrieved successfully',
        schema: { example: { id: 821011, todaySteps: 5000 } }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getTodaySteps(@Req() req: Request) {
        const userId = req.user!.id;
        const todaySteps = await this.userService.getTodaySteps(userId);
        return { userId, todaySteps };
    }
}