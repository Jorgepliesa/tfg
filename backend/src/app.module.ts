import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost', // Como es Docker en tu PC, usas localhost
  port: 5432,
  username: 'usuario_tfg',
  password: 'password_seguro',
  database: 'health_fitgame',
  entities: [/* tus entidades */],
  synchronize: true, // ¡Cuidado! En desarrollo crea las tablas automáticamente por ti
})