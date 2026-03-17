import { Injectable, NotFoundException } from "@nestjs/common";
import { Between, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Steps } from "../entities/Steps";


@Injectable()
export class StepsService {
    constructor(
        @InjectRepository(Steps)
        private stepsRepository: Repository<Steps>,
    ) {}

    // Obtener pasos de un dia especifico.
    async getNumSteps(userId: number, date: Date): Promise<number> {
        const steps = await this.stepsRepository.findOne({ 
            where: { 
                userId,
                date: Between(
                    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
                    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
                )
            } 
        });
        if (!steps) throw new NotFoundException('Steps not found');
        return steps.numSteps;
    }

    // Obtener pasos de hoy
    async getTodaySteps(id: number): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
        return await this.getNumSteps(id,today);
    }

    // Actualizar o crear pasos del dia
    async createOrUpdateSteps(userId: number, date: Date, numSteps: number): Promise<Steps> {
        const steps = await this.stepsRepository.findOne({
            where: { userId, date }
        });
        
        if (steps) {
            steps.numSteps = numSteps;
            return await this.stepsRepository.save(steps);
        }
        
        const newSteps = this.stepsRepository.create({ userId, date, numSteps });
        return await this.stepsRepository.save(newSteps);
    }
}