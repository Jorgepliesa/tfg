import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CoopChallenge, CoopChallengeStatus } from "../entities/CoopChallenge";
import { Steps } from "../entities/Steps";

@Injectable()
export class ChallengeService {
    constructor(
        @InjectRepository(CoopChallenge)
        private challengeRepository: Repository<CoopChallenge>,
        @InjectRepository(Steps)
        private stepsRepository: Repository<Steps>,
    ) {}

    async getActiveChallenge(): Promise<{
        name: string;
        startDate: Date;
        endDate: Date;
        totalSteps: number;
        currentSteps: number;
    }> {
        // Find active challenge
        let challenge = await this.challengeRepository.findOne({
            where: { status: CoopChallengeStatus.ACTIVE }
        });

        // Fallback: If no active challenge exists in DB, we create/mock one
        if (!challenge) {
            const defaultName = "El Dragón del Sedentarismo";
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 2); // started 2 days ago
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 5); // ends in 5 days
            
            try {
                challenge = this.challengeRepository.create({
                    name: defaultName,
                    startDate,
                    endDate,
                    status: CoopChallengeStatus.ACTIVE,
                    totalSteps: 100000,
                });
                challenge = await this.challengeRepository.save(challenge);
            } catch (err) {
                // If DB write fails, just construct a transient object
                challenge = {
                    name: defaultName,
                    startDate,
                    endDate,
                    status: CoopChallengeStatus.ACTIVE,
                    totalSteps: 100000,
                } as CoopChallenge;
            }
        }

        // Sum all user steps during this period
        const result = await this.stepsRepository
            .createQueryBuilder('steps')
            .select('SUM(steps.numSteps)', 'sum')
            .where('steps.date >= :startDate', { startDate: challenge.startDate })
            .andWhere('steps.date <= :endDate', { endDate: challenge.endDate })
            .getRawOne();
        
        const currentSteps = parseInt(result?.sum || '0', 10);

        return {
            name: challenge.name,
            startDate: challenge.startDate,
            endDate: challenge.endDate,
            totalSteps: challenge.totalSteps,
            currentSteps,
        };
    }
}
