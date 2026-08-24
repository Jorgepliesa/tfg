import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThan, Repository } from 'typeorm';
import { Routine, Difficulty } from '../entities/Routine';
import { Plan } from '../entities/Plan';
import { Exercise, ExerciseCategory, ExerciseDifficulty } from '../entities/Exercise';
import { Session } from '../entities/Session';
import { RoutineUpdateDto, ExerciseInRoutineDto, RoutineCategoryDto, RoutineListDto, RoutineCreateDto, RoutineForkDto } from '../dtos/routine.dto';
import { Execute } from '../entities/Execute';
import { WellnessTest, WellnessTestType } from '../entities/WellnessTest';
import { UserAccount } from '../entities/UserAccount';
import { ClinicalProfile } from '../entities/ClinicalProfile';

// Orden de dificultad para poder subir/bajar un nivel
export const DIFFICULTY_ORDER = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];

// Pesos del scoring — fáciles de ajustar sin tocar la lógica
export const SCORING_WEIGHTS = {
  DIFFICULTY_MATCH: 4,      // acierta exactamente con la dificultad objetivo
  DIFFICULTY_ADJACENT: 2,   // está a un nivel de la objetivo (mejor que un salto brusco)
  CATEGORY_ROTATION: 2,     // categoría distinta a la última sesión
  EQUIPMENT_MATCH: 1,       // coincide con la preferencia de material (tie-breaker si el filtro cayó al fallback)
  RECENT_PENALTY: -3,       // penalización por cada vez que aparece en las últimas sesiones
};

/** Desglose de puntuación de una rutina candidata (para trazabilidad y tests). */
export interface ScoreBreakdown {
  difficultyPoints: number;       // DIFFICULTY_MATCH o DIFFICULTY_ADJACENT o 0
  categoryRotationPoints: number; // CATEGORY_ROTATION o 0
  equipmentPoints: number;        // EQUIPMENT_MATCH o 0
  recentPenalty: number;          // RECENT_PENALTY * veces_repetida (≤ 0)
  total: number;                  // suma de todos los campos anteriores
}

/** Candidato mínimo necesario para calcular el score (sin acceso a BD). */
export interface ScoringCandidate {
  name: string;
  category: string;
  difficulty: string;
  usesEquipment: boolean;
}

/** Contexto de sesión necesario para el scoring. */
export interface ScoringContext {
  targetDifficulty: Difficulty;
  lastCategory: string | null;
  hasEquipment: boolean;
  usedEquipmentFallback: boolean;
  recentRoutineCounts: Map<string, number>;
}

/**
 * Función pura de scoring: calcula el desglose de puntuación de una rutina candidata
 * dado un contexto de sesión. No accede a la base de datos.
 */
export function scoreRoutine(
  candidate: ScoringCandidate,
  context: ScoringContext,
): ScoreBreakdown {
  const diffIndex = DIFFICULTY_ORDER.indexOf(candidate.difficulty as unknown as Difficulty);
  const targetIndex = DIFFICULTY_ORDER.indexOf(context.targetDifficulty);
  const diffDistance = Math.abs(diffIndex - targetIndex);

  let difficultyPoints = 0;
  if (diffDistance === 0) difficultyPoints = SCORING_WEIGHTS.DIFFICULTY_MATCH;
  else if (diffDistance === 1) difficultyPoints = SCORING_WEIGHTS.DIFFICULTY_ADJACENT;

  const categoryRotationPoints =
    context.lastCategory && candidate.category !== context.lastCategory
      ? SCORING_WEIGHTS.CATEGORY_ROTATION
      : 0;

  const equipmentPoints =
    !context.usedEquipmentFallback && candidate.usesEquipment === context.hasEquipment
      ? SCORING_WEIGHTS.EQUIPMENT_MATCH
      : 0;

  const timesRecent = context.recentRoutineCounts.get(candidate.name) ?? 0;
  const recentPenalty = SCORING_WEIGHTS.RECENT_PENALTY * timesRecent;

  const total = difficultyPoints + categoryRotationPoints + equipmentPoints + recentPenalty;

  return { difficultyPoints, categoryRotationPoints, equipmentPoints, recentPenalty, total };
}

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
    @InjectRepository(ClinicalProfile)
    private clinicalProfileRepository: Repository<ClinicalProfile>,
    @InjectRepository(UserAccount)
    private userRepository: Repository<UserAccount>,
  ) { }


  /**
   * Catálogo completo de ejercicios para el constructor de rutinas del supervisor,
   * marcando cuáles están contraindicados para el usuario actual (solo aviso, no bloqueo).
   */
  async getExerciseCatalog(userId: number): Promise<{
    name: string;
    description: string;
    category: string;
    difficulty: string;
    isContraindicated: boolean;
    equipment: string[];
    measurementParameters: string[];
    contraindications: string[];
  }[]> {
    const exercises = await this.exerciseRepository.find({
      relations: ['contraindications', 'equipment', 'measurementParameters'],
    });
    const contraindicationNames = await this.getUserContraindications(userId);

    return exercises.map((ex) => ({
      name: ex.name,
      description: ex.description,
      category: ex.category,
      difficulty: ex.difficulty,
      isContraindicated: (ex.contraindications || []).some((c) => contraindicationNames.has(c.name)),
      equipment: (ex.equipment || []).map((eq) => eq.name),
      measurementParameters: (ex.measurementParameters || []).map((p) => p.name),
      contraindications: (ex.contraindications || []).map((c) => c.name),
    }));
  }

  /**
   * Rutinas visibles para el usuario (genéricas + personales), con indicador de si es personal.
   */
  async getRoutinesForUser(userId: number, category?: ExerciseCategory): Promise<(RoutineListDto & { isPersonal: boolean })[]> {
    const routines = await this.routineRepository.find({
      relations: ['plans', 'plans.exerciseEntity'],
    });

    return routines
      .filter((r) => (r.assignedUserId === null || r.assignedUserId === userId) && (!category || (r.category as string) === (category as string)))
      .map((r) => {
        const plans = r.plans || [];
        const difficulties = new Set(plans.map((p) => p.exerciseEntity.difficulty));
        return {
          name: r.name,
          exerciseCount: plans.length,
          category: r.category,
          difficulty: Array.from(difficulties).join(', ') || r.difficulty,
          isPersonal: r.assignedUserId === userId,
        };
      });
  }

  /**
   * Detalle de una rutina para EDITAR (sin filtrar por contraindicaciones —
   * el supervisor debe ver todo y decidir; se marca cada ejercicio contraindicado
   * como aviso visual en el frontend).
   */
  async getRoutineForEditing(routineName: string, userId: number): Promise<{
    routineName: string;
    category: string;
    difficulty: string;
    isPersonal: boolean;
    exercises: (ExerciseInRoutineDto & {
      isContraindicated: boolean;
      equipment: string[];
      measurementParameters: string[];
      contraindications: string[];
    })[];
  }> {
    const routine = await this.routineRepository.findOne({ where: { name: routineName } });
    if (!routine) throw new NotFoundException(`Routine "${routineName}" not found`);

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
        'plan.rest AS "rest"',
      ])
      .getRawMany();

    const exerciseNames = exercisesRaw.map((e) => e.exerciseName);
    let equipmentByExercise = new Map<string, string[]>();
    let measurementByExercise = new Map<string, string[]>();
    let contraindicationsByExercise = new Map<string, string[]>();

    if (exerciseNames.length > 0) {
      const equipmentRows = await this.exerciseRepository.createQueryBuilder('exercise')
        .innerJoin('exercise.equipment', 'equipment')
        .where('exercise.name IN (:...names)', { names: exerciseNames })
        .select(['exercise.name AS "exerciseName"', 'equipment.name AS "name"'])
        .getRawMany();

      const measurementRows = await this.exerciseRepository.createQueryBuilder('exercise')
        .innerJoin('exercise.measurementParameters', 'param')
        .where('exercise.name IN (:...names)', { names: exerciseNames })
        .select(['exercise.name AS "exerciseName"', 'param.name AS "name"'])
        .getRawMany();

      const contraindicationRows = await this.exerciseRepository.createQueryBuilder('exercise')
        .innerJoin('exercise.contraindications', 'contraindication')
        .where('exercise.name IN (:...names)', { names: exerciseNames })
        .select(['exercise.name AS "exerciseName"', 'contraindication.name AS "name"'])
        .getRawMany();

      const groupByExercise = (rows: { exerciseName: string; name: string }[]): Map<string, string[]> => {
        const map = new Map<string, string[]>();
        for (const row of rows) {
          if (!map.has(row.exerciseName)) map.set(row.exerciseName, []);
          map.get(row.exerciseName)!.push(row.name);
        }
        return map;
      };

      equipmentByExercise = groupByExercise(equipmentRows);
      measurementByExercise = groupByExercise(measurementRows);
      contraindicationsByExercise = groupByExercise(contraindicationRows);
    }

    const contraindicationNames = await this.getUserContraindications(userId);
    let restrictedSet = new Set<string>();
    if (contraindicationNames.size > 0) {
      const restrictedRows = await this.exerciseRepository
        .createQueryBuilder('exercise')
        .innerJoin('exercise.contraindications', 'c')
        .where('c.name IN (:...names)', { names: Array.from(contraindicationNames) })
        .select('exercise.name', 'name')
        .getRawMany();
      restrictedSet = new Set(restrictedRows.map((r) => r.name));
    }

    return {
      routineName: routine.name,
      category: routine.category,
      difficulty: routine.difficulty,
      isPersonal: routine.assignedUserId === userId,
      exercises: exercisesRaw.map((e) => ({
        ...e,
        isContraindicated: restrictedSet.has(e.exerciseName),
        equipment: equipmentByExercise.get(e.exerciseName) ?? [],
        measurementParameters: measurementByExercise.get(e.exerciseName) ?? [],
        contraindications: contraindicationsByExercise.get(e.exerciseName) ?? [],
      })),
    };
  }

  /**
   * Crea una rutina personal desde cero, asignada al usuario actual.
   */
  async createPersonalRoutine(
    userId: number,
    dto: RoutineCreateDto,
  ): Promise<{ routineName: string; category: string; difficulty: string }> {
    const existing = await this.routineRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`A routine named "${dto.name}" already exists`);
    }

    const exerciseNames = dto.exercises.map((e) => e.exerciseName);
    const foundExercises = await this.exerciseRepository.find({ where: { name: In(exerciseNames) } });
    if (foundExercises.length !== new Set(exerciseNames).size) {
      throw new BadRequestException('One or more exercises do not exist');
    }

    const routine = this.routineRepository.create({
      name: dto.name,
      category: dto.category,
      difficulty: dto.difficulty,
      assignedUserId: userId,
    });
    await this.routineRepository.save(routine);

    const plans = dto.exercises.map((e) =>
      this.planRepository.create({
        routine: routine.name,
        exercise: e.exerciseName,
        numReps: e.numReps,
        numSeries: e.numSeries,
        duration: e.duration != null ? e.duration.toString() : null,
        rest: e.rest,
      }),
    );
    await this.planRepository.save(plans);

    return { routineName: routine.name, category: routine.category, difficulty: routine.difficulty };
  }

  /**
   * "Guardar como nueva": parte de una rutina existente (genérica o personal)
   * y crea una rutina personal NUEVA con los ajustes del supervisor.
   * Nunca modifica la rutina original.
   */
  async forkRoutine(
    userId: number,
    sourceRoutineName: string,
    dto: RoutineForkDto,
  ): Promise<{ routineName: string; category: string; difficulty: string }> {
    const source = await this.routineRepository.findOne({ where: { name: sourceRoutineName } });
    if (!source) throw new NotFoundException(`Routine "${sourceRoutineName}" not found`);

    return this.createPersonalRoutine(userId, {
      name: dto.newName,
      category: dto.category ?? source.category,
      difficulty: dto.difficulty ?? source.difficulty,
      exercises: dto.exercises,
    });
  }

  /**
   * Elimina una rutina personal (nunca una genérica).
   */
  async deletePersonalRoutine(userId: number, routineName: string): Promise<void> {
    const routine = await this.routineRepository.findOne({ where: { name: routineName } });
    if (!routine) throw new NotFoundException('Routine not found');
    if (routine.assignedUserId !== userId) {
      throw new BadRequestException('Cannot delete a routine that is not personally assigned to this user');
    }
    await this.planRepository.delete({ routine: routineName });
    await this.routineRepository.remove(routine);
  }

  /**
 * Actualiza in-situ una rutina personal existente (nunca una genérica).
 * Sustituye por completo su lista de ejercicios.
 */
  async updateRoutine(
    userId: number,
    routineName: string,
    dto: RoutineUpdateDto,
  ): Promise<{ routineName: string; category: string; difficulty: string }> {
    const routine = await this.routineRepository.findOne({ where: { name: routineName } });
    if (!routine) throw new NotFoundException(`Routine "${routineName}" not found`);
    if (routine.assignedUserId !== userId) {
      throw new BadRequestException('Only personal routines assigned to this user can be edited in place');
    }

    const exerciseNames = dto.exercises.map((e) => e.exerciseName);
    const foundExercises = await this.exerciseRepository.find({ where: { name: In(exerciseNames) } });
    if (foundExercises.length !== new Set(exerciseNames).size) {
      throw new BadRequestException('One or more exercises do not exist');
    }

    routine.category = dto.category ?? routine.category;
    routine.difficulty = dto.difficulty ?? routine.difficulty;
    await this.routineRepository.save(routine);

    await this.planRepository.delete({ routine: routine.name });
    const plans = dto.exercises.map((e) =>
      this.planRepository.create({
        routine: routine.name,
        exercise: e.exerciseName,
        numReps: e.numReps,
        numSeries: e.numSeries,
        duration: e.duration != null ? e.duration.toString() : null,
        rest: e.rest,
      }),
    );
    await this.planRepository.save(plans);

    return { routineName: routine.name, category: routine.category, difficulty: routine.difficulty };
  }

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
   * Devuelve el conjunto de nombres de contraindicaciones que presenta el usuario,
   */
  private async getUserContraindications(userId: number): Promise<Set<string>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return new Set();

    const profile = await this.clinicalProfileRepository.findOne({
      where: { id: user.id },
      relations: ['contraindications'],
    });
    if (!profile) return new Set();

    return new Set((profile.contraindications || []).map((l) => l.name));
  }

  /**
 * Get detailed routine info (for frontend to show all exercises)
 * Excluye las contraindicaciones del usuario.
 * TODO(futuro): cuando se integren datos monitorizados (frecuencia cardiaca,
 * SpO2 vía OmopSensorService), este filtro también podría excluir/ajustar
 * ejercicios de alta intensidad en tiempo real según lecturas recientes,
 * no solo según limitaciones estáticas del perfil clínico.
 */
  async getRoutineDetails(routineName: string, userId?: number): Promise<ExerciseInRoutineDto[]> {
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
      .orderBy( // ORDER BY PARA QUE SALGAN PRIMERO LOS CALENTAMIENTOS Y AL FINAL LOS ESTIRAMIENTOS
        `CASE exercise.category WHEN 'warmup' THEN 0 WHEN 'stretching' THEN 2 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('exercise.name', 'ASC')
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

    const exerciseNames = exercisesRaw.map((e) => e.exerciseName);

    // ── Adjuntar vídeo demostrativo (primer audiovisual asociado a cada ejercicio) ──
    const videoRows = await this.exerciseRepository.createQueryBuilder('exercise')
      .innerJoin('exercise.audiovisuals', 'av')
      .where('exercise.name IN (:...names)', { names: exerciseNames })
      .select(['exercise.name AS "exerciseName"', 'av.url AS "url"'])
      .getRawMany();

    const videoByExercise = new Map<string, string>();
    for (const row of videoRows) {
      if (!videoByExercise.has(row.exerciseName)) videoByExercise.set(row.exerciseName, row.url);
    }

    // ── Adjuntar material necesario, parámetros a medir ──
    const groupByExercise = (rows: { exerciseName: string; name: string }[]): Map<string, string[]> => {
      const map = new Map<string, string[]>();
      for (const row of rows) {
        if (!map.has(row.exerciseName)) map.set(row.exerciseName, []);
        map.get(row.exerciseName)!.push(row.name);
      }
      return map;
    };

    const equipmentRows = await this.exerciseRepository.createQueryBuilder('exercise')
      .innerJoin('exercise.equipment', 'equipment')
      .where('exercise.name IN (:...names)', { names: exerciseNames })
      .select(['exercise.name AS "exerciseName"', 'equipment.name AS "name"'])
      .getRawMany();

    const measurementRows = await this.exerciseRepository.createQueryBuilder('exercise')
      .innerJoin('exercise.measurementParameters', 'param')
      .where('exercise.name IN (:...names)', { names: exerciseNames })
      .select(['exercise.name AS "exerciseName"', 'param.name AS "name"'])
      .getRawMany();

    const equipmentByExercise = groupByExercise(equipmentRows);
    const measurementByExercise = groupByExercise(measurementRows);

    const withExtras = exercisesRaw.map((e) => ({
      ...e,
      videoUrl: videoByExercise.get(e.exerciseName) ?? null,
      equipment: equipmentByExercise.get(e.exerciseName) ?? [],
      measurementParameters: measurementByExercise.get(e.exerciseName) ?? [],
    }));

    if (!userId) return withExtras;

    const contraindicationNames = await this.getUserContraindications(userId);
    if (contraindicationNames.size === 0) return withExtras;

    const restrictedRows = await this.exerciseRepository
      .createQueryBuilder('exercise')
      .innerJoin('exercise.contraindications', 'contraindication')
      .where('contraindication.name IN (:...names)', { names: Array.from(contraindicationNames) })
      .select('exercise.name', 'name')
      .getRawMany();

    const restrictedSet = new Set(restrictedRows.map((r) => r.name));
    const filtered = withExtras.filter((e) => !restrictedSet.has(e.exerciseName));

    if (filtered.length === 0) {
      throw new BadRequestException(
        `Routine "${routineName}" has no exercises compatible with the user's current limitations`,
      );
    }

    return filtered;
  }

  /**
   * Recomienda una rutina combinando:
   * - Filtro duro por material disponible (con fallback si no hay coincidencias)
   * - Ajuste de dificultad objetivo según dolor/fatiga y ratio de compleción de la última sesión
   * - Rotación de categoría respecto a la última rutina hecha
   * - Penalización por repetición reciente
   * - Solo considera rutinas personalizadas para el usuario (Segun sus contraindicaciones y parámetros)
   */
  async recommendRoutine(
    userId: number,
    hasEquipment: boolean,
  ): Promise<{ routineName: string; category: string; difficulty: string }> {
    const contraindications = await this.getUserContraindications(userId);

    const routines = await this.routineRepository.find({
      relations: ['plans', 'plans.exerciseEntity', 'plans.exerciseEntity.equipment', 'plans.exerciseEntity.contraindications'],
    });

    const visibleRoutines = routines.filter(
      (r) => r.assignedUserId === null || r.assignedUserId === userId,
    );

    if (visibleRoutines.length === 0) {
      throw new NotFoundException('No routines available for this user');
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
      where: { userId, duration: MoreThan(0) },
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

    // 4) Scoring — delega en la función pura exportada scoreRoutine
    const scoringContext: ScoringContext = {
      targetDifficulty,
      lastCategory,
      hasEquipment,
      usedEquipmentFallback: usedFallback,
      recentRoutineCounts,
    };

    let bestScore = -Infinity;
    let bestCandidates: typeof candidates = [];

    for (const c of candidates) {
      const breakdown = scoreRoutine(
        {
          name: c.routine.name,
          category: c.routine.category,
          difficulty: c.routine.difficulty,
          usesEquipment: c.usesEquipment,
        },
        scoringContext,
      );

      if (breakdown.total > bestScore) {
        bestScore = breakdown.total;
        bestCandidates = [c];
      } else if (breakdown.total === bestScore) {
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
