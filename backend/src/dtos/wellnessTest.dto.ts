import { ApiProperty } from '@nestjs/swagger';
import { WellnessTestType } from '../entities/WellnessTest';
import { IsEnum, IsInt, Max, Min } from 'class-validator';

// POST: Datos enviados por el cliente para crear un nuevo wellness test
export class WellnessTestCreateDto { 
  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 5,
    description: 'Pain level (1-5 Likert scale)',
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  pain: number;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 5,
    description: 'Sleepiness level (1-5)',
    example: 2,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  sleepiness: number;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 5,
    description: 'Mood level (1-5)',
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  mood: number;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 5,
    description: 'Fatigue level (1-5)',
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  fatigue: number;

  @ApiProperty({
    enum: WellnessTestType,
    description: 'Type of wellness test',
    example: WellnessTestType.INITIAL,
  })
  @IsEnum(WellnessTestType)
  type: WellnessTestType;
}

// Response: Datos enviados por el servidor al cliente al solicitar wellness tests
export class WellnessTestResponseDto {
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'The timestamp of the session',
    example: '2026-03-25T10:30:00Z'
  })
  session: Date;

  @ApiProperty({
    type: 'integer',
    description: 'The user account ID',
    example: 42
  })
  userId: number;

  @ApiProperty({
    enum: WellnessTestType,
    description: 'Type of wellness test',
    example: WellnessTestType.INITIAL
  })
  type: WellnessTestType;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 5,
    description: 'Pain level (1-5)',
    example: 3
  })
  pain: number;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 5,
    description: 'Sleepiness level (1-5)',
    example: 2
  })
  sleepiness: number;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 5,
    description: 'Mood level (1-5)',
    example: 4
  })
  mood: number;

  @ApiProperty({
    type: 'integer',
    minimum: 1,
    maximum: 5,
    description: 'Fatigue level (1-5)',
    example: 3
  })
  fatigue: number;
/*
  constructor(
    session: Date,
    userId: number,
    type: WellnessTestType,
    pain: number,
    sleepiness: number,
    mood: number,
    fatigue: number,
  ) {
    this.session = session;
    this.userId = userId;
    this.type = type;
    this.pain = pain;
    this.sleepiness = sleepiness;
    this.mood = mood;
    this.fatigue = fatigue;
  }*/
}