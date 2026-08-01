import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, In } from 'typeorm';
import { ClinicalProfile } from '../entities/ClinicalProfile';
import { Session } from '../entities/Session';
import { Steps } from '../entities/Steps';
import { WellnessTest, WellnessTestType } from '../entities/WellnessTest';
import { Execute } from '../entities/Execute';
import { UserAccount } from '../entities/UserAccount';
import { ClinicalProfileCreateDto, ClinicalProfileUpdateDto } from '../dtos/clinicalProfile.dto';
import { SupervisorNote } from '../entities/SupervisorNote';
import { Contraindication } from '../entities/Contraindication';

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
        @InjectRepository(SupervisorNote)
        private noteRepository: Repository<SupervisorNote>,
        @InjectRepository(Contraindication)
        private contraindicationRepository: Repository<Contraindication>,
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

        const rows = await this.executeRepository
            .createQueryBuilder('e')
            .innerJoin('exercise', 'ex', 'ex.name = e.exercise')
            .innerJoin('session', 's',
                's.date = e.session AND s.user_id = e.user_id')
            .where('s.user_id = :userId', { userId })
            .andWhere('s.date >= :from', { from })
            .select('ex.category', 'category')
            .addSelect('COUNT(DISTINCT s.date)', 'count')
            .groupBy('ex.category')
            .getRawMany();

        const categoryCount: Record<string, number> = {
            aerobic: 0, strength: 0, flexibility: 0, balance: 0,
        };
        for (const row of rows) {
            if (row.category in categoryCount) {
                categoryCount[row.category] = parseInt(row.count);
            }
        }

        const total = await this.sessionRepository.count({
            where: { userId, date: Between(from, new Date()) },
        });
        const completed = await this.sessionRepository.count({
            where: { userId, date: Between(from, new Date()), duration: MoreThan(0) },
        });

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
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['avatarEntity'] });
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
            streak: await this.computeStreak(userId),
            todaySteps: todaySteps?.numSteps ?? 0,
            sessionsThisMonth,
            fp: user.avatarEntity?.fp ?? 0,
        };
    }

    // Cromos desbloqueados
    async getMemorialCount(userId: number) {
        const { Has } = await import('../entities/Has.js');
        const count = await this.profileRepository.manager.count('has', {
            where: { userId },
        });
        return count;
    }

    // ─── Adherencia ───────────────────────────────────────────────────────────────
    async getAdherence(userId: number) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Días hábiles transcurridos este mes (L-V)
        let plannedDays = 0;
        const cursor = new Date(monthStart);
        while (cursor <= now) {
            const dow = cursor.getDay();
            if (dow >= 1 && dow <= 5) plannedDays++;
            cursor.setDate(cursor.getDate() + 1);
        }

        // Sesiones completadas (duration > 0)
        const completed = await this.sessionRepository.count({
            where: {
                userId,
                date: Between(monthStart, now),
                duration: MoreThan(0),
            },
        });

        // Cap: no puede superar los días planificados
        const capped = Math.min(completed, plannedDays);
        const pct = plannedDays > 0 ? Math.round((capped / plannedDays) * 100) : 0;

        const status: 'green' | 'yellow' | 'red' =
            pct >= 70 ? 'green' : pct >= 40 ? 'yellow' : 'red';

        return { completed, planned: plannedDays, pct, status };
    }

    private async computeStreak(userId: number): Promise<number> {
        const sessions = await this.sessionRepository.find({
            where: { userId, duration: MoreThan(0) },
            order: { date: 'DESC' },
        });

        const completedDays = new Set(sessions.map(s => new Date(s.date).toISOString().slice(0, 10)));

        let streak = 0;
        const cursor = new Date();
        cursor.setHours(0, 0, 0, 0);

        while (completedDays.has(cursor.toISOString().slice(0, 10))) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        }

        return streak;
    }

    async getWeeklyCompletion(userId: number): Promise<boolean[]> {
        const now = new Date();
        const dayOfWeek = (now.getDay() + 6) % 7; // 0=lunes ... 6=domingo
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const sessions = await this.sessionRepository.find({
            where: { userId, date: Between(monday, sunday), duration: MoreThan(0) },
        });

        const completedDays = new Set(sessions.map(s => new Date(s.date).getDay()));
        return Array.from({ length: 7 }, (_, i) => completedDays.has((i + 1) % 7));
    }

    // ─── Notas ────────────────────────────────────────────────────────────────────
    async getNotes(userId: number): Promise<SupervisorNote[]> {
        return this.noteRepository.find({
            where: { clinicalProfile: userId },
            order: { date: 'DESC' },
            take: 20,
        });
    }

    async addNote(userId: number, content: string): Promise<SupervisorNote> {
        const note = this.noteRepository.create({ clinicalProfile: userId, content, date: new Date() });
        return this.noteRepository.save(note);
    }

    async deleteNote(userId: number, date: string): Promise<void> {
        await this.noteRepository.delete({ clinicalProfile: userId, date: new Date(date) });
    }

    // ─── Contraindicaciones ─────────────────────────────────────────────────────────
    async getContraindicationCatalog(): Promise<Contraindication[]> {
        return this.contraindicationRepository.find({
            order: { name: 'ASC' },
        });
    }

    async getUserContraindications(userId: number): Promise<Contraindication[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const profile = await this.profileRepository.findOne({
            where: { id: user.clinicalProfile },
            relations: ['contraindications'],
        });
        return profile?.contraindications ?? [];
    }

    async updateContraindications(userId: number, names: string[]): Promise<Contraindication[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const profile = await this.profileRepository.findOne({
            where: { id: user.clinicalProfile },
            relations: ['contraindications'],
        });
        if (!profile) throw new NotFoundException('Clinical profile not found');

        const selected = await this.contraindicationRepository.find({
            where: { name: In(names) },
        });
        if (selected.length !== names.length) {
            throw new BadRequestException('One or more contraindications do not exist');
        }

        profile.contraindications = selected;
        await this.profileRepository.save(profile);

        return selected;
    }

    // ─── Gráficas ─────────────────────────────────────────────────────────
    async getMoodTrend(userId: number, limit: number = 14): Promise<{ date: string; mood: number }[]> {
        const tests = await this.wellnessRepository.find({
            where: { userId },
            order: { session: 'DESC' },
            take: limit * 2, // initial + final por sesión
        });

        const bySession = new Map<string, number[]>();
        for (const t of tests) {
            const key = new Date(t.session).toISOString();
            if (!bySession.has(key)) bySession.set(key, []);
            bySession.get(key)!.push(t.mood);
        }

        return Array.from(bySession.entries())
            .map(([date, moods]) => ({
                date,
                mood: Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-limit);
    }

    async getPrePostComparison(userId: number, limit: number = 10): Promise<{
        metric: string; before: number; after: number;
    }[]> {
        const tests = await this.wellnessRepository.find({
            where: { userId },
            order: { session: 'DESC' },
            take: limit * 2,
        });

        const initials = tests.filter(t => t.type === WellnessTestType.INITIAL);
        const finals = tests.filter(t => t.type === WellnessTestType.FINAL);

        const avg = (arr: typeof tests, field: 'pain' | 'fatigue' | 'mood') =>
            arr.length > 0 ? Math.round((arr.reduce((sum, t) => sum + t[field], 0) / arr.length) * 10) / 10 : 0;

        return [
            { metric: 'Dolor', before: avg(initials, 'pain'), after: avg(finals, 'pain') },
            { metric: 'Fatiga', before: avg(initials, 'fatigue'), after: avg(finals, 'fatigue') },
            { metric: 'Ánimo', before: avg(initials, 'mood'), after: avg(finals, 'mood') },
        ];
    }
}