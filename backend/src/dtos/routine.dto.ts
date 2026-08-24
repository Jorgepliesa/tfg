import { ApiProperty } from '@nestjs/swagger';
import { ExerciseCategory, ExerciseDifficulty } from '../entities/Exercise';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsNumber, IsEnum, IsArray, ArrayMinSize, ValidateNested, IsOptional } from 'class-validator';
import { Category, Difficulty } from '../entities/Routine';

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
    description: 'The duration of the exercise, in minutes. Null if the exercise is measured only by reps.',
    nullable: true,
  })
  duration: string | null;

  @ApiProperty({
    example: 60,
    description: 'Rest time in seconds between sets',
  })
  rest: number;

  @ApiProperty({
    type: String,
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Demonstration video url, if available',
    nullable: true,
  })
  videoUrl: string | null;

  @ApiProperty({
    type: [String],
    example: ['Weights', 'Mat'],
    description: 'Equipment required for this exercise',
  })
  equipment: string[];

  @ApiProperty({
    type: [String],
    example: ['Heart Rate'],
    description: 'Measurement parameters tracked during this exercise',
  })
  measurementParameters: string[];
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

export class RoutineExercisePlanDto {
  @ApiProperty({ example: 'Sentadilla con apoyo' })
  @IsString() @IsNotEmpty()
  exerciseName: string;

  @ApiProperty({ example: 10 })
  @IsInt() @Min(1) @Max(999)
  numReps: number;

  @ApiProperty({ example: 3 })
  @IsInt() @Min(1) @Max(99)
  numSeries: number;

  @ApiProperty({ example: 3, description: 'Duración en minutos' })
  @IsNumber() @Min(0.1) @Max(1439) @IsOptional()
  duration?: number;

  @ApiProperty({ example: 60, description: 'Descanso en segundos' })
  @IsInt() @Min(0) @Max(3599)
  rest: number;
}

export class RoutineCreateDto {
  @ApiProperty({ example: 'Fuerza Básica (ajustada)' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Category })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ enum: Difficulty })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({ type: [RoutineExercisePlanDto] })
  @IsArray() @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoutineExercisePlanDto)
  exercises: RoutineExercisePlanDto[];
}

export class RoutineForkDto {
  @ApiProperty({ example: 'Fuerza Básica (ajustada)' })
  @IsString() @IsNotEmpty()
  newName: string;

  @ApiProperty({ enum: Category, required: false })
  @IsOptional() @IsEnum(Category)
  category?: Category;

  @ApiProperty({ enum: Difficulty, required: false })
  @IsOptional() @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ type: [RoutineExercisePlanDto] })
  @IsArray() @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoutineExercisePlanDto)
  exercises: RoutineExercisePlanDto[];
}

export class RoutineUpdateDto {
  @ApiProperty({ enum: Category, required: false })
  @IsOptional() @IsEnum(Category)
  category?: Category;

  @ApiProperty({ enum: Difficulty, required: false })
  @IsOptional() @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ type: [RoutineExercisePlanDto] })
  @IsArray() @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoutineExercisePlanDto)
  exercises: RoutineExercisePlanDto[];
}