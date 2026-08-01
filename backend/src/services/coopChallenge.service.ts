import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CoopChallenge, CoopChallengeStatus } from "../entities/CoopChallenge";
import { Steps } from "../entities/Steps";
import { Memorial } from "../entities/Memorial";
import { Complete } from "../entities/Complete";
import { Has } from "../entities/Has";
import { UserAccount } from "../entities/UserAccount";

const CHALLENGE_DURATION_DAYS = 14;
const DEFAULT_TOTAL_STEPS = 100000; // TODO: ajustar dinámicamente según nº de jugadores activos

const CHALLENGE_NAME_POOL = [
    'El Dragón del Sedentarismo',
    'El Gigante de Cristal',
    'La Serpiente del Sofá',
    'El Ogro Perezoso',
    'El Fantasma de la Fatiga',
];

@Injectable()
export class ChallengeService {
    constructor(
        @InjectRepository(CoopChallenge)
        private challengeRepository: Repository<CoopChallenge>,
        @InjectRepository(Steps)
        private stepsRepository: Repository<Steps>,
        @InjectRepository(Memorial)
        private memorialRepository: Repository<Memorial>,
        @InjectRepository(UserAccount)
        private userRepository: Repository<UserAccount>,
        @InjectRepository(Complete)
        private completeRepository: Repository<Complete>,
        @InjectRepository(Has)
        private hasRepository: Repository<Has>,
    ) { }

    /**
     * Elige un cromo del catálogo que todavía no se haya usado como recompensa
     * de NINGÚN reto anterior (relación 1:1 real, no solo por convención).
     */
    private async pickRewardMemorial(): Promise<string | null> {
        const usedRows = await this.challengeRepository
            .createQueryBuilder('challenge')
            .select('challenge.memorial', 'name')
            .where('challenge.memorial IS NOT NULL')
            .getRawMany();
        const usedNames = new Set(usedRows.map((r) => r.name));

        const allMemorials = await this.memorialRepository.find();
        const unusedMemorials = allMemorials.filter((m) => !usedNames.has(m.name));

        if (unusedMemorials.length === 0) {
            // Catálogo de cromos agotado: ya no quedan recompensas nuevas que dar.
            // TODO: cuando esto pase con frecuencia, ampliar el catálogo de Memorial
            // o definir una recompensa alternativa (ej. bonus de FP) para este caso.
            return null;
        }

        return unusedMemorials[Math.floor(Math.random() * unusedMemorials.length)].name;
    }

    /**
     * Devuelve el reto activo, resolviéndolo primero (con recompensa) si ya se
     * superó el objetivo de pasos o si su fecha límite ya pasó, y creando el
     * siguiente automáticamente en cualquiera de esos dos casos.
     */
    async getActiveChallenge(): Promise<{
        name: string;
        startDate: Date;
        endDate: Date;
        totalSteps: number;
        currentSteps: number;
        memorial: string | null;
        isDefeated: boolean;
    }> {
        let challenge = await this.challengeRepository.findOne({
            where: { status: CoopChallengeStatus.ACTIVE },
        });

        if (challenge) {
            const currentSteps = await this.getCurrentSteps(challenge);
            const isDefeated = currentSteps >= challenge.totalSteps;
            const isExpired = new Date() >= challenge.endDate;

            if (isDefeated || isExpired) {
                await this.resolveChallenge(challenge, isDefeated);
                challenge = null; // forzamos crear el siguiente más abajo
            }
        }

        if (!challenge) {
            challenge = await this.createNextChallenge();
        }

        const currentSteps = await this.getCurrentSteps(challenge);

        return {
            name: challenge.name,
            startDate: challenge.startDate,
            endDate: challenge.endDate,
            totalSteps: challenge.totalSteps,
            currentSteps,
            memorial: challenge.memorial,
            isDefeated: currentSteps >= challenge.totalSteps,
        };
    }

    private async getCurrentSteps(challenge: CoopChallenge): Promise<number> {
        const result = await this.stepsRepository
            .createQueryBuilder('steps')
            .select('SUM(steps.numSteps)', 'sum')
            .where('steps.date >= :startDate', { startDate: challenge.startDate })
            .andWhere('steps.date <= :endDate', { endDate: challenge.endDate })
            .getRawOne();

        return parseInt(result?.sum || '0', 10);
    }

    /**
     * Cierra un reto: lo marca inactivo y, si se ha superado el objetivo,
     * entrega la recompensa (cromo) a todos los que aportaron pasos.
     */
    private async resolveChallenge(challenge: CoopChallenge, wasDefeated: boolean): Promise<void> {
        challenge.status = CoopChallengeStatus.INACTIVE;
        await this.challengeRepository.save(challenge);

        if (wasDefeated) {
            await this.awardParticipants(challenge);
        }
    }

    private async awardParticipants(challenge: CoopChallenge): Promise<void> {
        const participantRows = await this.stepsRepository
            .createQueryBuilder('steps')
            .select('DISTINCT steps.userId', 'userId')
            .where('steps.date >= :startDate', { startDate: challenge.startDate })
            .andWhere('steps.date <= :endDate', { endDate: challenge.endDate })
            .andWhere('steps.numSteps > 0')
            .getRawMany();

        for (const row of participantRows) {
            const user = await this.userRepository.findOne({ where: { id: row.userId } });
            if (!user) continue;

            // Histórico: este avatar completó este reto
            const alreadyCompleted = await this.completeRepository.findOne({
                where: { challenge: challenge.name, avatar: user.avatar },
            });
            if (!alreadyCompleted) {
                await this.completeRepository.save(
                    this.completeRepository.create({ challenge: challenge.name, avatar: user.avatar }),
                );
            }

            // Recompensa: desbloquear el cromo asignado a este reto
            if (challenge.memorial) {
                const alreadyHas = await this.hasRepository.findOne({
                    where: { memorial: challenge.memorial, userId: user.id },
                });
                if (!alreadyHas) {
                    await this.hasRepository.save(
                        this.hasRepository.create({ memorial: challenge.memorial, userId: user.id }),
                    );
                }
            }
        }
    }

    private async createNextChallenge(): Promise<CoopChallenge> {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + CHALLENGE_DURATION_DAYS);

        const challenge = this.challengeRepository.create({
            name: this.generateChallengeName(),
            startDate,
            endDate,
            status: CoopChallengeStatus.ACTIVE,
            totalSteps: DEFAULT_TOTAL_STEPS,
            memorial: await this.pickRewardMemorial(),
        });

        return this.challengeRepository.save(challenge);
    }

    private generateChallengeName(): string {
        const base = CHALLENGE_NAME_POOL[Math.floor(Math.random() * CHALLENGE_NAME_POOL.length)];
        // 'name' es la clave primaria, así que añadimos la fecha para garantizar unicidad
        return `${base} (${new Date().toISOString().slice(0, 10)})`;
    }
}
