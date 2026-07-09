import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Routine, Difficulty } from '../entities/Routine';
import { Plan } from '../entities/Plan';
import { Exercise, ExerciseCategory, ExerciseDifficulty } from '../entities/Exercise';
import { Session } from '../entities/Session';
import { RoutineDetailsDto, ExerciseInRoutineDto, RoutineCategoryDto, RoutineListDto } from '../dtos/routine.dto';
import { Execute } from '../entities/Execute';
import { WellnessTest, WellnessTestType } from '../entities/WellnessTest';

// Orden de dificultad para poder subir/bajar un nivel
const DIFFICULTY_ORDER = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];

// Pesos del scoring — fáciles de ajustar sin tocar la lógica
const WEIGHTS = {
  DIFFICULTY_MATCH: 4,      // acierta exactamente con la dificultad objetivo
  DIFFICULTY_ADJACENT: 2,   // está a un nivel de la objetivo (mejor que un salto brusco)
  CATEGORY_ROTATION: 2,     // categoría distinta a la última sesión
  EQUIPMENT_MATCH: 1,       // coincide con la preferencia de material (tie-breaker si el filtro cayó al fallback)
  RECENT_PENALTY: -3,       // penalización por cada vez que aparece en las últimas sesiones
};

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(WellnessTest)
    private wellnessTestRepository: Repository<WellnessTest>,
    @InjectRepository(Execute)
    private executeRepository: Repository<Execute>,
  ) { }


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

  /**
   * Recomienda una rutina combinando:
   * - Filtro duro por material disponible (con fallback si no hay coincidencias)
   * - Ajuste de dificultad objetivo según dolor/fatiga y ratio de compleción de la última sesión
   * - Rotación de categoría respecto a la última rutina hecha
   * - Penalización por repetición reciente
   */
  async recommendRoutine(
    userId: number,
    hasEquipment: boolean,
  ): Promise<{ routineName: string; category: string; difficulty: string }> {
    const routines = await this.routineRepository.find({
      relations: ['plans', 'plans.exerciseEntity', 'plans.exerciseEntity.equipment'],
    });

    if (routines.length === 0) {
      throw new NotFoundException('No routines available');
    }

    const withUsage = routines.map((r) => ({
      routine: r,
      usesEquipment: (r.plans || []).some(
        (p) => p.exerciseEntity?.equipment && p.exerciseEntity.equipment.length > 0,
      ),
    }));

    // 1) Filtro duro por material (con fallback a todas si no hay coincidencias)
    let candidates = withUsage.filter((r) => r.usesEquipment === hasEquipment);
    const usedFallback = candidates.length === 0;
    if (usedFallback) {
      candidates = withUsage;
    }

    // 2) Historial reciente
    const recentSessions = await this.sessionRepository.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 5,
    });

    const recentRoutineCounts = new Map<string, number>();
    for (const s of recentSessions) {
      recentRoutineCounts.set(s.routine, (recentRoutineCounts.get(s.routine) ?? 0) + 1);
    }

    const lastSession = recentSessions[0] ?? null;
    const lastRoutine = lastSession
      ? routines.find((r) => r.name === lastSession.routine) ?? null
      : null;
    const lastCategory = lastRoutine?.category ?? null;

    // 3) Calcular dificultad objetivo a partir de la última sesión (dolor/fatiga + ratio de compleción)
    const targetDifficulty = await this.computeTargetDifficulty(userId, lastSession, lastRoutine);

    // 4) Scoring
    let bestScore = -Infinity;
    let bestCandidates: typeof candidates = [];

    for (const c of candidates) {
      let score = 0;

      const diffIndex = DIFFICULTY_ORDER.indexOf(c.routine.difficulty as unknown as Difficulty);
      const targetIndex = DIFFICULTY_ORDER.indexOf(targetDifficulty);
      const diffDistance = Math.abs(diffIndex - targetIndex);

      if (diffDistance === 0) score += WEIGHTS.DIFFICULTY_MATCH;
      else if (diffDistance === 1) score += WEIGHTS.DIFFICULTY_ADJACENT;

      if (lastCategory && c.routine.category !== lastCategory) {
        score += WEIGHTS.CATEGORY_ROTATION;
      }

      if (!usedFallback && c.usesEquipment === hasEquipment) {
        score += WEIGHTS.EQUIPMENT_MATCH;
      }

      const timesRecent = recentRoutineCounts.get(c.routine.name) ?? 0;
      score += WEIGHTS.RECENT_PENALTY * timesRecent;

      if (score > bestScore) {
        bestScore = score;
        bestCandidates = [c];
      } else if (score === bestScore) {
        bestCandidates.push(c);
      }
    }

    // Empate -> elegir al azar entre los mejores para no ser siempre determinista
    const chosen = bestCandidates[Math.floor(Math.random() * bestCandidates.length)].routine;

    return {
      routineName: chosen.name,
      category: chosen.category,
      difficulty: chosen.difficulty,
    };
  }

  /**
   * Determina la dificultad objetivo para la próxima rutina:
   * - Sin historial -> EASY (arranque conservador)
   * - Dolor/fatiga altos en el test inicial de la última sesión, o baja compleción -> bajar un nivel
   * - Dolor/fatiga bajos y alta compleción -> subir un nivel
   * - En cualquier otro caso -> mantener la dificultad de la última rutina
   */
  private async computeTargetDifficulty(
    userId: number,
    lastSession: Session | null,
    lastRoutine: Routine | null,
  ): Promise<Difficulty> {
    if (!lastSession || !lastRoutine) {
      return Difficulty.EASY;
    }

    const start = new Date(lastSession.date);
    start.setMilliseconds(0);
    const end = new Date(lastSession.date);
    end.setMilliseconds(999);

    const initialTest = await this.wellnessTestRepository.findOne({
      where: {
        session: Between(start, end),
        userId,
        type: WellnessTestType.INITIAL,
      },
    });

    const executes = await this.executeRepository.find({
      where: {
        session: Between(start, end),
        userId,
      },
    });

    const plans = await this.planRepository.find({
      where: { routine: lastRoutine.name },
    });
    const planByExercise = new Map(plans.map((p) => [p.exercise, p]));

    let completionRatio = 1; // sin datos -> asumimos que fue bien, no penalizamos
    if (executes.length > 0) {
      const ratios = executes
        .map((e) => {
          const plan = planByExercise.get(e.exercise);
          if (!plan) return null;
          const target = plan.numReps * plan.numSeries;
          if (target <= 0) return null;
          return Math.min(e.numRepsDone / target, 1);
        })
        .filter((r): r is number => r !== null);

      if (ratios.length > 0) {
        completionRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
      }
    }

    const currentIndex = DIFFICULTY_ORDER.indexOf(lastRoutine.difficulty as unknown as Difficulty);
    const painOrFatigueHigh = initialTest ? initialTest.pain >= 4 || initialTest.fatigue >= 4 : false;
    const painAndFatigueLow = initialTest ? initialTest.pain <= 2 && initialTest.fatigue <= 2 : false;

    let newIndex = currentIndex;
    if (painOrFatigueHigh || completionRatio < 0.6) {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (painAndFatigueLow && completionRatio > 0.9) {
      newIndex = Math.min(DIFFICULTY_ORDER.length - 1, currentIndex + 1);
    }

    return DIFFICULTY_ORDER[newIndex];
  }
}
