import { DataSource, type DataSourceOptions } from 'typeorm';
import { type SeederOptions } from 'typeorm-extension';
import * as dotenv from 'dotenv';
dotenv.config();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['src/entities/*.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    seeds: ['src/database/seeds/main.seeder.ts'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;