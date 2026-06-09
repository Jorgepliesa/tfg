import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Exercise, ExerciseCategory, ExerciseDifficulty } from '../../entities/Exercise';

export class ExerciseSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Exercise);

        const exercises = [
            {
                name: 'Marcha en el sitio',
                description: 'Caminar sin desplazarse, levantando las rodillas suavemente.',
                category: ExerciseCategory.AEROBIC,
                difficulty: ExerciseDifficulty.EASY,
            },
            {
                name: 'Saltos de tijera suaves',
                description: 'Jumping jacks a bajo impacto, sin despegar los pies del suelo.',
                category: ExerciseCategory.AEROBIC,
                difficulty: ExerciseDifficulty.MEDIUM,
            },
            {
                name: 'Sentadilla con apoyo',
                description: 'Sentadilla sujetándose a una silla para mayor estabilidad.',
                category: ExerciseCategory.STRENGTH,
                difficulty: ExerciseDifficulty.EASY,
            },
            {
                name: 'Flexiones de pared',
                description: 'Flexiones apoyando las manos en la pared en lugar del suelo.',
                category: ExerciseCategory.STRENGTH,
                difficulty: ExerciseDifficulty.EASY,
            },
            {
                name: 'Estiramiento de isquiotibiales',
                description: 'Sentado, extender una pierna y alcanzar el pie suavemente.',
                category: ExerciseCategory.FLEXIBILITY,
                difficulty: ExerciseDifficulty.EASY,
            },
            {
                name: 'Estiramiento de cuádriceps',
                description: 'De pie, doblar la rodilla y sujetar el tobillo con la mano.',
                category: ExerciseCategory.FLEXIBILITY,
                difficulty: ExerciseDifficulty.EASY,
            },
            {
                name: 'Equilibrio monopodal',
                description: 'Mantenerse sobre un pie durante 10-30 segundos.',
                category: ExerciseCategory.BALANCE,
                difficulty: ExerciseDifficulty.EASY,
            },
            {
                name: 'Caminar en línea recta',
                description: 'Caminar poniendo un pie delante del otro sobre una línea.',
                category: ExerciseCategory.BALANCE,
                difficulty: ExerciseDifficulty.EASY,
            },
            {
                name: 'Bicicleta estática suave',
                description: 'Pedaleo a ritmo suave durante 10-15 minutos.',
                category: ExerciseCategory.AEROBIC,
                difficulty: ExerciseDifficulty.EASY,
            },
            {
                name: 'Yoga del guerrero I',
                description: 'Postura de guerrero I, manteniendo el equilibrio y la respiración.',
                category: ExerciseCategory.BALANCE,
                difficulty: ExerciseDifficulty.MEDIUM,
            },
        ];

        for (const ex of exercises) {
            const exists = await repo.findOne({ where: { name: ex.name } });
            if (!exists) {
                await repo.save(repo.create(ex));
                console.log(`  ✓ Exercise: ${ex.name}`);
            }
        }
    }
}