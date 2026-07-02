import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsDateString } from 'class-validator';

// POST /execute/create - Cliente ejecuta un ejercicio
export class ExecuteCreateDto {
  @ApiProperty({
    example: 'Push-ups',
    description: 'The name of the exercise performed',
  })
  @IsString()
  @IsNotEmpty()
  exercise: string;

  @ApiProperty({
    example: 20,
    description: 'The number of repetitions completed',
    minimum: 0,
    maximum: 999,
  })
  @IsInt()
  @Min(0)
  @Max(999)
  @IsNotEmpty()
  numRepsDone: number;

  @ApiProperty({
    example: 3,
    description: 'Number of series completed',
    minimum: 1,
    maximum: 99,
  })
  @IsInt()
  @Min(1)
  @Max(99)
  @IsNotEmpty()
  numSeriesDone: number;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    example: '2026-04-06T10:00:00Z',
    description: 'Timestamp when exercise started',
  })
  @IsDateString()
  @IsNotEmpty()
  tInitial: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    example: '2026-04-06T10:05:00Z',
    description: 'Timestamp when exercise ended',
  })
  @IsDateString()
  @IsNotEmpty()
  tFinal: Date;
}

// Response when exercise is saved
export class ExecuteResponseDto {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    example: '2026-04-06T10:00:00Z',
  })
  session: Date;

  @ApiProperty({
    example: 1,
  })
  userId: number;

  @ApiProperty({
    example: 'Push-ups',
  })
  exercise: string;

  @ApiProperty({
    example: 20,
  })
  numRepsDone: number;

  @ApiProperty({ example: 3 })
  numSeriesDone: number;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  tInitial: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  tFinal: Date;

  @ApiProperty({
    type: 'number',
    description: 'Duration in seconds',
    example: 300,
  })
  duration?: number;
}

// GET /execute/session/:sessionDate - Get all exercises in a session
export class ExecuteSessionListDto {
  @ApiProperty({
    type: [ExecuteResponseDto],
    description: 'List of exercises executed in this session',
  })
  exercises: ExecuteResponseDto[];

  @ApiProperty({
    example: 5,
    description: 'Total number of exercises in session',
  })
  totalExercises: number;

  @ApiProperty({
    example: 1500,
    description: 'Total duration of all exercises in seconds',
  })
  totalDuration: number;
}
