import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsNumber, Min, Max } from 'class-validator';

// Nested DTO para tests dentro de SessionResponseDto
export class WellnessTestResponseDto {
  @ApiProperty({
    enum: ['INITIAL', 'FINAL'],
    example: 'INITIAL',
  })
  type: string;

  @ApiProperty({ example: 2 })
  pain: number;

  @ApiProperty({ example: 3 })
  sleepiness: number;

  @ApiProperty({ example: 4 })
  mood: number;

  @ApiProperty({ example: 2 })
  fatigue: number;
}

// Nested DTO para ejercicios dentro de SessionResponseDto
export class ExecuteResponseDto {
  @ApiProperty({ example: 'Push-ups' })
  exercise: string;

  @ApiProperty({ example: 20 })
  numRepsDone: number;

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
}

// POST /session/start - Cliente inicia sesión
export class SessionCreateDto {
  @ApiProperty({
    example: 'Morning Routine',
    description: 'The name of the routine to perform',
  })
  @IsString()
  @IsNotEmpty()
  routine: string;

  @ApiProperty({
    example: false,
    description: 'Whether this is a cooperative session',
  })
  @IsBoolean()
  @IsNotEmpty()
  isCoop: boolean;
}

// GET /session/current o POST /session/start response
export class SessionResponseDto {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'The timestamp when the session started',
    example: '2026-04-06T10:30:00Z',
  })
  date: Date;

  @ApiProperty({
    example: 1,
    description: 'The user account ID',
  })
  userId: number;

  @ApiProperty({
    example: 30,
    description: 'Session duration in minutes (0 if still in progress)',
  })
  duration: number;

  @ApiProperty({
    example: 'Morning Routine',
    description: 'The routine name',
  })
  routine: string;

  @ApiProperty({
    example: false,
    description: 'Whether this is a cooperative session',
  })
  isCoop: boolean;

  @ApiProperty({
    type: Object,
    description: 'Initial wellness test (if exists)',
    example: {
      type: 'INITIAL',
      pain: 2,
      sleepiness: 3,
      mood: 4,
      fatigue: 2,
    },
    nullable: true,
  })
  initialTest?: WellnessTestResponseDto;

  @ApiProperty({
    type: Object,
    description: 'Final wellness test (if exists)',
    nullable: true,
  })
  finalTest?: WellnessTestResponseDto;

  @ApiProperty({
    type: Array,
    description: 'List of exercises performed in this session',
    example: [],
  })
  executes?: ExecuteResponseDto[];
}

// PATCH /session/end - Completar sesión
export class SessionUpdateDto {
  @ApiProperty({
    example: 30,
    description: 'Final duration of the session in minutes',
  })
  @IsNumber()
  @Min(1)
  @Max(1440)
  duration: number;
}