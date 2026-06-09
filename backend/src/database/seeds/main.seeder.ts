import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ExerciseSeeder } from './exercise.seeder';
import { RoutineSeeder } from './routine.seeder';
import { ItemSeeder } from './item.seeder';
import { MemorialSeeder } from './memorial.seeder';

export class MainSeeder implements Seeder {
    async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        console.log('\n Exercises...');
        await new ExerciseSeeder().run(dataSource);

        console.log('\n Routines...');
        await new RoutineSeeder().run(dataSource);

        console.log('\n  Items...');
        await new ItemSeeder().run(dataSource);

        console.log('\n Memorials...');
        await new MemorialSeeder().run(dataSource);
    }
}