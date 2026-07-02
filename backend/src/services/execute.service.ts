import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Execute } from '../entities/Execute';
import { Session } from '../entities/Session';
import { Exercise } from '../entities/Exercise';
import { ExecuteCreateDto, ExecuteResponseDto, ExecuteSessionListDto } from '../dtos/execute.dto';

@Injectable()
export class ExecuteService {
  constructor(
    @InjectRepository(Execute)
    private executeRepository: Repository<Execute>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) { }

  /**
   * Create/save an executed exercise
   */
  async createExecute(
    sessionDate: Date,
    userId: number,
    createExecuteDto: ExecuteCreateDto,
  ): Promise<ExecuteResponseDto> {
    // Validate session exists
    const session = await this.sessionRepository.findOne({
      where: {
        date: sessionDate,
        userId: userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Validate exercise exists
    const exercise = await this.exerciseRepository.findOne({
      where: {
        name: createExecuteDto.exercise,
      },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise "${createExecuteDto.exercise}" not found`);
    }

    // Validate times
    const tInitial = new Date(createExecuteDto.tInitial);
    const tFinal = new Date(createExecuteDto.tFinal);

    if (tFinal <= tInitial) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for duplicates (same exercise in same session)
    const existing = await this.executeRepository.findOne({
      where: {
        session: sessionDate,
        userId: userId,
        exercise: createExecuteDto.exercise,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Exercise "${createExecuteDto.exercise}" already executed in this session`,
      );
    }

    // Create and save
    const exec = this.executeRepository.create({
      session: sessionDate,
      userId: userId,
      exercise: createExecuteDto.exercise,
      numRepsDone: createExecuteDto.numRepsDone,
      numSeriesDone: createExecuteDto.numSeriesDone,
      tInitial: tInitial,
      tFinal: tFinal,
    });

    const saved = await this.executeRepository.save(exec);

    return this.toResponseDto(saved);
  }

  /**
   * Get all exercises executed in a session
   */
  async getSessionExecutes(
    sessionDate: Date,
    userId: number,
  ): Promise<ExecuteSessionListDto> {
    const executes = await this.executeRepository.find({
      where: {
        session: sessionDate,
        userId: userId,
      },
      order: {
        tInitial: 'ASC',
      },
    });

    if (executes.length === 0) {
      return {
        exercises: [],
        totalExercises: 0,
        totalDuration: 0,
      };
    }

    let totalDuration = 0;
    const exercises = executes.map((e) => {
      const dto = this.toResponseDto(e);
      const duration = (e.tFinal.getTime() - e.tInitial.getTime()) / 1000; // seconds
      dto.duration = duration;
      totalDuration += duration;
      return dto;
    });

    return {
      exercises,
      totalExercises: executes.length,
      totalDuration,
    };
  }

  /**
   * Get a specific executed exercise
   */
  async getExecute(
    sessionDate: Date,
    userId: number,
    exerciseName: string,
  ): Promise<ExecuteResponseDto> {
    const exec = await this.executeRepository.findOne({
      where: {
        session: sessionDate,
        userId: userId,
        exercise: exerciseName,
      },
    });

    if (!exec) {
      throw new NotFoundException('Exercise execution not found');
    }

    return this.toResponseDto(exec);
  }

  /**
   * Check if user completed all exercises in a routine
   */
  async hasCompletedAllExercises(
    sessionDate: Date,
    userId: number,
    exercises: string[],
  ): Promise<boolean> {
    const completed = await this.executeRepository.count({
      where: {
        session: sessionDate,
        userId: userId,
        exercise: exercises as any,
      },
    });

    return completed === exercises.length;
  }

  private toResponseDto(execute: Execute): ExecuteResponseDto {
    return {
      session: execute.session,
      userId: execute.userId,
      exercise: execute.exercise,
      numRepsDone: execute.numRepsDone,
      numSeriesDone: execute.numSeriesDone,
      tInitial: execute.tInitial,
      tFinal: execute.tFinal,
    };
  }
}
