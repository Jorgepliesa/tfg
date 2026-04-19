import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';
import { WellnessTestCreateDto, WellnessTestResponseDto } from '../dtos/wellnessTest.dto';
import { WellnessTestService } from '../services/wellnessTest.service';


@ApiTags('Wellness Tests')
@Controller('wellness-test')
export class WellnessTestController {
  constructor(private wellnessTestService: WellnessTestService) {}

  @Get('my-tests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'List of wellness tests',
    type: [WellnessTestResponseDto]
  })
  async getWellnessTests(@Request() req) {
    return this.wellnessTestService.findByUser(req.user.id);
  }

  @Get('session-tests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'List of wellness tests for the session',
    type: [WellnessTestResponseDto]
  })
  async getSessionWellnessTests(@Request() req) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecer a medianoche para obtener solo la fecha
    return this.wellnessTestService.findBySession(today, req.user.id);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Wellness test created',
    type: WellnessTestResponseDto,
  })
  async createWellnessTest(@Request() req, @Body() createWellnessTestDto: WellnessTestCreateDto) {
    return this.wellnessTestService.createForCurrentSession(req.user.id, createWellnessTestDto);
  }
}