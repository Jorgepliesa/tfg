import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from '../entities/Routine';
import { Plan } from '../entities/Plan';
import { Exercise, ExerciseCategory, ExerciseDifficulty } from '../entities/Exercise';
import { RoutineDetailsDto, ExerciseInRoutineDto, RoutineCategoryDto, RoutineListDto } from '../dtos/routine.dto';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  
  /**
   * Get all available routine categories
   */
  /*async getCategories(): Promise<RoutineCategoryDto[]> {
    const routines = await this.routineRepository.find({
      relations: ['plans', 'plans.exerciseEntity'],
    });

    const categoryMap = new Map<string, Set<string>>();

    for (const routine of routines) {
      for (const plan of routine.plans) {
        const category = plan.exerciseEntity.category;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, new Set());
        }
        categoryMap.get(category).add(routine.name);
      }
    }

    return Array.from(categoryMap.entries()).map(([category, routines]) => ({
      name: category,
      routineCount: routines.size,
    }));
  }
*/
  /**
   * Get all routines (with basic info) OLD
   */
  async getAllRoutines(): Promise<RoutineListDto[]> {
    const routines = await this.routineRepository.find({
      relations: ['plans', 'plans.exerciseEntity'],
    });

    return routines.map((routine) => {
      const plans = routine.plans || [];
      const categories = new Set(
        plans.map((p) => p.exerciseEntity.category)
      );
      const difficulties = new Set(
        plans.map((p) => p.exerciseEntity.difficulty)
      );

      return {
        name: routine.name,
        exerciseCount: plans.length,
        category: Array.from(categories).join(', '),
        difficulty: Array.from(difficulties).join(', '),
      };
    });
  }

  /**
   * Get routines by category OLD
   */
  async getRoutinesByCategory(
    category: ExerciseCategory,
  ): Promise<RoutineListDto[]> {
    const routines = await this.routineRepository.find({
      relations: ['plans', 'plans.exerciseEntity'],
    });

    return routines
      .filter((routine) =>
        routine.plans.some((p) => p.exerciseEntity.category === category),
      )
      .map((routine) => {
        const plans = routine.plans.filter(
          (p) => p.exerciseEntity.category === category,
        );
        const difficulties = new Set(
          plans.map((p) => p.exerciseEntity.difficulty)
        );

        return {
          name: routine.name,
          exerciseCount: plans.length,
          category: category,
          difficulty: Array.from(difficulties).join(', '),
        };
      });
  }

  /**
   * Get detailed routine info (for frontend to show all exercises)
   */
  async getRoutineDetails(routineName: string): Promise<ExerciseInRoutineDto[]> {
    // Usamos getRawMany para obtener un array plano directo desde SQL sin hidratar entidades pesadas
    const exercisesRaw = await this.planRepository.createQueryBuilder('plan')
      .innerJoin('plan.exerciseEntity', 'exercise')
      .where('plan.routine = :routineName', { routineName })
      .select([
        'plan.exercise AS "exerciseName"',
        'exercise.description AS "description"',
        'exercise.category AS "category"',
        'exercise.difficulty AS "difficulty"',
        'plan.num_reps AS "numReps"',
        'plan.num_series AS "numSeries"',
        'plan.duration AS "duration"',
        'plan.rest AS "rest"'
      ])
      .getRawMany();

    if (exercisesRaw.length === 0) {
      // Comprobamos rápidamente si la rutina no existe o si simplemente está vacía
      const routineExists = await this.routineRepository.createQueryBuilder('routine')
        .where('routine.name = :routineName', { routineName })
        .getExists();

      if (!routineExists) {
        throw new NotFoundException(`Routine "${routineName}" not found`);
      }
      throw new BadRequestException(`Routine "${routineName}" has no exercises`);
    }

    return exercisesRaw; // Devolvemos directamente el array de ejercicios
  }

  /**
   * Suggest a routine based on category and user profile
   * Retorna el nombre de la rutina sugerida, categoria y dificultad.
   */
  async suggestRoutine(
    userId: number,
    category: ExerciseCategory,
  ): Promise<{ routineName: string; category: string; difficulty: string }> {
    // Consulta optimizada: Buscamos primero en la tabla de Rutinas directamente
    // ya que hemos añadido category a Routine en BBDD.sql
    let routineInfo = await this.routineRepository.createQueryBuilder('routine')
      .where('routine.category = :category', { category })
      .select([
        'routine.name AS "routineName"',
        'routine.category AS "category"',
        'routine.difficulty AS "difficulty"'
      ])
      .limit(1)
      .getRawOne();

    // Fallback: Si no tiene el atributo category en Routine y usamos el viejo diseño
    if (!routineInfo) {
       routineInfo = await this.routineRepository.createQueryBuilder('routine')
        .innerJoin('routine.plans', 'plan')
        .innerJoin('plan.exerciseEntity', 'exercise')
        .where('exercise.category = :category', { category })
        .select([
          'routine.name AS "routineName"',
          'exercise.category AS "category"',
          'exercise.difficulty AS "difficulty"'
        ])
        .limit(1)
        .getRawOne();
    }

    if (!routineInfo) {
      throw new NotFoundException(
        `No routines found for category "${category}"`,
      );
    }

    return {
      routineName: routineInfo.routineName,
      category: routineInfo.category,
      difficulty: routineInfo.difficulty,
    };
  }
}
