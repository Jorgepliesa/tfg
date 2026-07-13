import { Controller, Get, Query, UseGuards, Req, Param, Body, Delete, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';
import { RoutineService } from '../services/routine.service';
import {
  RoutineDetailsDto,
  RoutineCategoryDto,
  RoutineListDto,
  ExerciseInRoutineDto,
  RoutineForkDto,
  RoutineCreateDto,
} from '../dtos/routine.dto';
import { ExerciseCategory } from '../entities/Exercise';
import type { Request } from 'express';

@ApiTags('Routines')
@Controller('routine')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RoutineController {
  constructor(private routineService: RoutineService) { }

  /**
   * GET /routine
   * Get all routines (optional filter by category)
   */
  @Get()
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ExerciseCategory,
    description: 'Filter routines by category (optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of routines',
    type: [RoutineListDto],
  })
  async getRoutines(
    @Query('category') category?: ExerciseCategory,
  ): Promise<RoutineListDto[]> {
    if (category) {
      return this.routineService.getRoutinesByCategory(category);
    }
    return this.routineService.getAllRoutines();
  }

  /**
   * GET /routine/suggest?category=aerobic
   * Suggest a routine based on category and user profile
   */
  @Get('suggest')
  @ApiQuery({
    name: 'category',
    required: true,
    enum: ExerciseCategory,
    description: 'Category to suggest routine for',
  })
  @ApiResponse({
    status: 200,
    description: 'Suggested routine info',
    schema: {
      example: {
        routineName: 'Morning Cardio Blast',
        category: 'aerobic',
        difficulty: 'easy'
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (e.g., missing category)',
  })
  async suggestRoutine(
    @Req() req: Request,
    @Query('category') category: ExerciseCategory, // Se pone query por el parametro: GET /routine/suggest?category=aerobic
  ): Promise<{ routineName: string; category: string; difficulty: string }> {
    return this.routineService.suggestRoutine(req.user!.id, category);
  }

  /**
     * GET /routine/recommend?hasEquipment=true
     * Recomienda una rutina según material disponible e historial
     */
  @Get('recommend')
  @ApiQuery({
    name: 'hasEquipment',
    required: true,
    type: Boolean,
    description: 'Si el usuario dispone de material/equipamiento',
  })
  @ApiResponse({
    status: 200,
    description: 'Rutina recomendada',
    schema: {
      example: { routineName: 'Fuerza Básica', category: 'strength', difficulty: 'easy' },
    },
  })
  async recommendRoutine(
    @Req() req: Request,
    @Query('hasEquipment') hasEquipment: string,
  ): Promise<{ routineName: string; category: string; difficulty: string }> {
    const hasEquipmentBool = hasEquipment === 'true' || hasEquipment === '1';
    return this.routineService.recommendRoutine(req.user!.id, hasEquipmentBool);
  }

  @Get('exercises/catalog')
  @ApiResponse({ status: 200, description: 'Catálogo completo de ejercicios disponibles' })
  async getExerciseCatalog(@Req() req: Request) {
    return this.routineService.getExerciseCatalog(req.user!.id);
  }

  @Get('mine')
  @ApiResponse({ status: 200, description: 'Rutinas visibles para el usuario (genéricas + personales)' })
  async getMyRoutines(@Req() req: Request) {
    return this.routineService.getRoutinesForUser(req.user!.id);
  }

  @Get(':name/edit-view')
  @ApiResponse({ status: 200, description: 'Detalle de una rutina para edición, sin filtrar por contraindicaciones' })
  async getRoutineForEditing(@Req() req: Request, @Param('name') name: string) {
    return this.routineService.getRoutineForEditing(name, req.user!.id);
  }

  @Post()
  @ApiBody({ type: RoutineCreateDto })
  @ApiResponse({ status: 201, description: 'Rutina personal creada desde cero' })
  async createRoutine(@Req() req: Request, @Body() dto: RoutineCreateDto) {
    return this.routineService.createPersonalRoutine(req.user!.id, dto);
  }

  @Post(':name/fork')
  @ApiBody({ type: RoutineForkDto })
  @ApiResponse({ status: 201, description: 'Rutina personal creada a partir de otra existente' })
  async forkRoutine(@Req() req: Request, @Param('name') name: string, @Body() dto: RoutineForkDto) {
    return this.routineService.forkRoutine(req.user!.id, name, dto);
  }

  @Delete(':name')
  @ApiResponse({ status: 200, description: 'Rutina personal eliminada' })
  async deleteRoutine(@Req() req: Request, @Param('name') name: string) {
    await this.routineService.deletePersonalRoutine(req.user!.id, name);
    return { success: true };
  }

  /**
   * GET /routine/:name
   * Get detailed routine (all exercises with reps, series, duration, rest)
   */
  @Get(':name')
  @ApiResponse({
    status: 200,
    description: 'List of exercises for the routine',
    type: [ExerciseInRoutineDto],
  })
  async getRoutineDetails(@Param('name') name: string): Promise<ExerciseInRoutineDto[]> {
    return this.routineService.getRoutineDetails(name);
  }
}
