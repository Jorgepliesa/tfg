import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ClinicalProfile } from '../entities/ClinicalProfile';
import { Session } from '../entities/Session';
import { Steps } from '../entities/Steps';
import { WellnessTest } from '../entities/WellnessTest';
import { Execute } from '../entities/Execute';
import { UserAccount } from '../entities/UserAccount';
import { ClinicalProfileCreateDto, ClinicalProfileUpdateDto } from '../dtos/clinicalProfile.dto';

@Injectable()
export class ClinicalProfileService {
    constructor(
        @InjectRepository(ClinicalProfile)
        private profileRepository: Repository<ClinicalProfile>,
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        @InjectRepository(Steps)
        private stepsRepository: Repository<Steps>,
        @InjectRepository(WellnessTest)
        private wellnessRepository: Repository<WellnessTest>,
        @InjectRepository(Execute)
        private executeRepository: Repository<Execute>,
        @InjectRepository(UserAccount)
        private userRepository: Repository<UserAccount>,
    ) { }

    async getProfile(userId: number): Promise<ClinicalProfile | null> {
        return this.profileRepository.findOne({ where: { id: userId } });
    }

    async createOrUpdateProfile(
        userId: number,
        dto: ClinicalProfileCreateDto | ClinicalProfileUpdateDto,
    ): Promise<ClinicalProfile> {
        const existing = await this.profileRepository.findOne({ where: { id: userId } });

        if (existing) {
            Object.assign(existing, dto);
            return this.profileRepository.save(existing);
        }

        const profile = this.profileRepository.create({ id: userId, ...dto });
        return this.profileRepository.save(profile);
    }

    // Pasos últimos N días
    async getRecentSteps(userId: number, days: number = 14) {
        const from = new Date();
        from.setDate(from.getDate() - days);
        from.setHours(0, 0, 0, 0);

        const steps = await this.stepsRepository.find({
            where: {
                userId,
                date: Between(from, new Date()),
            },
            order: { date: 'ASC' },
        });

        return steps.map(s => ({
            date: s.date,
            numSteps: s.numSteps,
            isReached: s.isReached,
        }));
    }

    // Sesiones por tipo de ejercicio (último mes)
    async getSessionsByCategory(userId: number) {
        const from = new Date();
        from.setDate(from.getDate() - 30);

        const sessions = await this.sessionRepository.find({
            where: { userId, date: Between(from, new Date()) },
        });

        // Contar por rutina (podría enriquecerse con categoría si se joinea con Exercise)
        const total = sessions.length;
        const completed = sessions.filter(s => s.duration > 0).length;

        // Contar ejercicios ejecutados por categoría en estas sesiones
        const categoryCount: Record<string, number> = {
            aerobic: 0, strength: 0, flexibility: 0, balance: 0,
        };

        for (const session of sessions) {
            const executes = await this.executeRepository
                .createQueryBuilder('e')
                .innerJoin('exercise', 'ex', 'ex.name = e.exercise')
                .where('e.session = :date', { date: session.date })
                .andWhere('e.user_id = :userId', { userId })
                .select(['ex.category AS category', 'COUNT(*) AS count'])
                .groupBy('ex.category')
                .getRawMany();

            for (const row of executes) {
                if (categoryCount[row.category] !== undefined) {
                    categoryCount[row.category] += parseInt(row.count);
                }
            }
        }

        return { total, completed, categoryCount };
    }

    // Media de wellness tests últimas 4 semanas
    async getWellnessAverage(userId: number) {
        const from = new Date();
        from.setDate(from.getDate() - 28);

        const tests = await this.wellnessRepository.find({
            where: { userId, session: Between(from, new Date()) },
        });

        if (tests.length === 0) return null;

        const avg = (field: keyof Pick<WellnessTest, 'pain' | 'fatigue' | 'sleepiness' | 'mood'>) =>
            parseFloat((tests.reduce((sum, t) => sum + t[field], 0) / tests.length).toFixed(1));

        return {
            pain: avg('pain'),
            fatigue: avg('fatigue'),
            sleepiness: avg('sleepiness'),
            mood: avg('mood'),
            count: tests.length,
        };
    }

    // Racha y stats generales
    async getDashboardStats(userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todaySteps = await this.stepsRepository.findOne({
            where: { userId, date: Between(todayStart, new Date()) },
        });

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const sessionsThisMonth = await this.sessionRepository.count({
            where: { userId, date: Between(monthStart, new Date()) },
        });

        return {
            streak: user.streak,
            todaySteps: todaySteps?.numSteps ?? 0,
            sessionsThisMonth,
        };
    }

    // Cromos desbloqueados
    async getMemorialCount(userId: number) {
        const { Has } = await import('../entities/has.js');
        const count = await this.profileRepository.manager.count('has', {
            where: { userId },
        });
        return count;
    }
}