import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Session } from "../entities/Session";
import { WellnessTest, WellnessTestType } from "../entities/WellnessTest";
import { Execute } from "../entities/Execute";
import { SessionCreateDto, SessionResponseDto, WellnessTestResponseDto, ExecuteResponseDto } from "../dtos/session.dto";

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        @InjectRepository(WellnessTest)
        private wellnessTestRepository: Repository<WellnessTest>,
        @InjectRepository(Execute)
        private executeRepository: Repository<Execute>,
    ) {}

    async canStartSession(userId: number): Promise<boolean> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const sessionToday = await this.sessionRepository.findOne({
            where: {
                userId: userId,
                date: Between(today, endOfDay),
            },
        });

        return !sessionToday;
    }

    async startSession(userId: number, createSessionDto: SessionCreateDto): Promise<SessionResponseDto> {
        /*const canStart = await this.canStartSession(userId);
        if (!canStart) {
            throw new BadRequestException('User already has a session created today. Only one session per day is allowed.');
        }*/

        const now = new Date();
        
        const session = this.sessionRepository.create({
            date: now,
            userId: userId,
            routine: createSessionDto.routine,
            isCoop: createSessionDto.isCoop,
            duration: 1, // Cambiado a 1 porque si no me daba error
        });

        const savedSession = await this.sessionRepository.save(session);

        return this.toResponseDto(savedSession);
    }

    async getActiveSession(userId: number): Promise<SessionResponseDto> {
        // Obtener la sesión activa (duration = 0 o la más reciente sin completar)
        const session = await this.sessionRepository.findOne({
            where: {
                userId: userId,
            },
            order: {
                date: 'DESC',
            },
        });

        if (!session) {
            throw new NotFoundException('No active session found for this user');
        }

        return this.toResponseDto(session);
    }

    async endSession(userId: number, duration: number): Promise<SessionResponseDto> {
        // Obtener la sesión activa
        const session = await this.sessionRepository.findOne({
            where: {
                userId: userId,
            },
            order: {
                date: 'DESC',
            },
        });

        if (!session) {
            throw new NotFoundException('No active session found');
        }

        // Actualizar duración
        session.duration = duration;
        const updatedSession = await this.sessionRepository.save(session);

        return this.toResponseDto(updatedSession);
    }

    // Métodos privados para convertir entidades a DTOs
    private async toResponseDto(session: Session): Promise<SessionResponseDto> {
        const start = new Date(session.date);
        start.setMilliseconds(0);
        const end = new Date(session.date);
        end.setMilliseconds(999);
        // Cargar tests y ejercicios si no están cargados
        const wellnessTests = await this.wellnessTestRepository.find({
            where: {
                session: Between(start, end),
                userId: session.userId,
            },
        });

        const executes = await this.executeRepository.find({
            where: {
                session: Between(start, end),
                userId: session.userId,
            },
        });

        const initialTest = wellnessTests.find((t) => t.type === WellnessTestType.INITIAL);
        const finalTest = wellnessTests.find((t) => t.type === WellnessTestType.FINAL);

        return {
            date: session.date,
            userId: session.userId,
            duration: session.duration,
            routine: session.routine,
            isCoop: session.isCoop,
            initialTest: initialTest ? this.toWellnessTestDto(initialTest) : undefined,
            finalTest: finalTest ? this.toWellnessTestDto(finalTest) : undefined,
            executes: executes.map((e) => this.toExecuteDto(e)),
        };
    }

    private toWellnessTestDto(test: WellnessTest): WellnessTestResponseDto {
        return {
            type: test.type,
            pain: test.pain,
            sleepiness: test.sleepiness,
            mood: test.mood,
            fatigue: test.fatigue,
        };
    }

    private toExecuteDto(execute: Execute): ExecuteResponseDto {
        return {
            exercise: execute.exercise,
            numRepsDone: execute.numRepsDone,
            tInitial: execute.tInitial,
            tFinal: execute.tFinal,
        };
    }
}