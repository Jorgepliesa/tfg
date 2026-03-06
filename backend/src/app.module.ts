import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

// Importar todas las entidades
import { UserAccount } from './entities/UserAccount';
import { Avatar } from './entities/Avatar';
import { Session } from './entities/Session';
import { WellnessTest } from './entities/WellnessTest';
import { Steps } from './entities/Steps';
import { Item } from './entities/Item';
import { Keep } from './entities/Keep';
import { Exercise } from './entities/Exercise';
import { Routine } from './entities/Routine';
import { Plan } from './entities/Plan';
import { Execute } from './entities/Execute';
import { Complete } from './entities/Complete';
import { CoopChallenge } from './entities/CoopChallenge';
import { Memorial } from './entities/Memorial';
import { Has } from './entities/has';
import { Audiovisual } from './entities/Audiovisual';
import { MuscleGroup } from './entities/MuscleGroup';
import { Equipment } from './entities/Equipment';
import { MeasurementParameter } from './entities/MeasurementParameter';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Configuración de TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'usuario_tfg',
      password: process.env.DB_PASSWORD || 'password_seguro',
      database: process.env.DB_NAME || 'health_fitgame',
      entities: [
        UserAccount,
        Avatar,
        Session,
        WellnessTest,
        Steps,
        Item,
        Keep,
        Exercise,
        Routine,
        Plan,
        Execute,
        Complete,
        CoopChallenge,
        Memorial,
        Has,
        Audiovisual,
        MuscleGroup,
        Equipment,
        MeasurementParameter,
      ],
      synchronize: false, // ¡IMPORTANTE! false en producción para no perder datos
      logging: process.env.NODE_ENV === 'development',
    }),
    
    // Módulos de funcionalidad
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}