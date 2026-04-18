import { ApiProperty } from '@nestjs/swagger';
import { ExerciseCategory, ExerciseDifficulty } from '../entities/Exercise';

export class ExerciseInRoutineDto {
  @ApiProperty({
    example: 'Push-ups',
    description: 'The name of the exercise',
  })
  exerciseName: string;

  @ApiProperty({
    example: 'Perform push-ups for strength building',
    description: 'Exercise description',
  })
  description: string;

  @ApiProperty({
    enum: ExerciseCategory,
    example: ExerciseCategory.STRENGTH,
    description: 'Exercise category',
  })
  category: ExerciseCategory;

  @ApiProperty({
    enum: ExerciseDifficulty,
    example: ExerciseDifficulty.MEDIUM,
    description: 'Exercise difficulty level',
  })
  difficulty: ExerciseDifficulty;

  @ApiProperty({
    example: 20,
    description: 'Number of repetitions',
  })
  numReps: number;

  @ApiProperty({
    example: 3,
    description: 'Number of series',
  })
  numSeries: number;

  @ApiProperty({
    example: '00:01:30',
    description: 'Duration of the exercise',
  })
  duration: string;

  @ApiProperty({
    example: 60,
    description: 'Rest time in seconds between sets',
  })
  rest: number;
}

export class RoutineDetailsDto {
  @ApiProperty({
    example: 'Morning Cardio',
    description: 'The name of the routine',
  })
  routineName: string;

  @ApiProperty({
    type: [ExerciseInRoutineDto],
    description: 'List of exercises in this routine',
  })
  exercises: ExerciseInRoutineDto[];

  @ApiProperty({
    example: 'aerobic',
    description: 'Primary category of the routine',
  })
  primaryCategory: string;

  @ApiProperty({
    example: 'easy',
    description: 'Overall difficulty of the routine',
  })
  difficulty: string;
}

export class RoutineCategoryDto {
  @ApiProperty({
    example: 'aerobic',
    description: 'Category name',
  })
  name: string;

  @ApiProperty({
    example: 5,
    description: 'Number of routines in this category',
  })
  routineCount: number;
}

export class RoutineListDto {
  @ApiProperty({
    example: 'Morning Cardio',
    description: 'Routine name',
  })
  name: string;

  @ApiProperty({
    example: 5,
    description: 'Number of exercises in this routine',
  })
  exerciseCount: number;

  @ApiProperty({
    example: 'aerobic',
    description: 'Primary category',
  })
  category: string;

  @ApiProperty({
    example: 'easy',
    description: 'Difficulty level',
  })
  difficulty: string;
}
