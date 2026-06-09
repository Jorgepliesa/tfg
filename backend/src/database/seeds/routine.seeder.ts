import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Routine, Category, Difficulty } from '../../entities/Routine';
import { Plan } from '../../entities/Plan';

export class RoutineSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const routineRepo = dataSource.getRepository(Routine);
        const planRepo = dataSource.getRepository(Plan);

        const routines = [
            {
                name: 'Cardio Suave',
                category: Category.AEROBIC,
                difficulty: Difficulty.EASY,
                exercises: [
                    { name: 'Marcha en el sitio', numReps: 20, numSeries: 2, duration: '5', rest: 60 },
                    { name: 'Bicicleta estática suave', numReps: 1, numSeries: 1, duration: '10', rest: 120 },
                ],
            },
            {
                name: 'Fuerza Básica',
                category: Category.STRENGTH,
                difficulty: Difficulty.EASY,
                exercises: [
                    { name: 'Sentadilla con apoyo', numReps: 10, numSeries: 3, duration: '3', rest: 90 },
                    { name: 'Flexiones de pared', numReps: 8, numSeries: 3, duration: '3', rest: 90 },
                ],
            },
            {
                name: 'Flexibilidad Completa',
                category: Category.FLEXIBILITY,
                difficulty: Difficulty.EASY,
                exercises: [
                    { name: 'Estiramiento de isquiotibiales', numReps: 3, numSeries: 2, duration: '4', rest: 30 },
                    { name: 'Estiramiento de cuádriceps', numReps: 3, numSeries: 2, duration: '4', rest: 30 },
                ],
            },
            {
                name: 'Equilibrio y Coordinación',
                category: Category.BALANCE,
                difficulty: Difficulty.EASY,
                exercises: [
                    { name: 'Equilibrio monopodal', numReps: 5, numSeries: 3, duration: '3', rest: 45 },
                    { name: 'Caminar en línea recta', numReps: 5, numSeries: 2, duration: '3', rest: 30 },
                ],
            },
        ];

        for (const r of routines) {
            let routine = await routineRepo.findOne({ where: { name: r.name } });
            if (!routine) {
                routine = await routineRepo.save(
                    routineRepo.create({
                        name: r.name,
                        category: r.category,
                        difficulty: r.difficulty,
                    })
                );
                console.log(`  ✓ Routine: ${r.name}`);
            }

            for (const ex of r.exercises) {
                const exists = await planRepo.findOne({
                    where: { routine: routine.name, exercise: ex.name },
                });
                if (!exists) {
                    await planRepo.save(planRepo.create({
                        routine: routine.name,
                        exercise: ex.name,
                        numReps: ex.numReps,
                        numSeries: ex.numSeries,
                        duration: ex.duration,
                        rest: ex.rest,
                    }));
                }
            }
        }
    }
}