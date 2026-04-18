import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AvatarModule } from './modules/avatar.module';
import { UserModule } from './modules/user.module';
import { RoutineModule } from './modules/routine.module';
import { ExecuteModule } from './modules/execute.module';

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
import { WellnessTestModule } from './modules/wellnessTest.module';
import { SessionModule } from './modules/session.module';

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
      username: process.env.DB_USERNAME || 'admin_821011',
      password: process.env.DB_PASSWORD || '0000',
      database: process.env.DB_NAME || 'fitgame',
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
      synchronize: false, // ¡IMPORTANTE! false en producción para no perder datos TODO
      logging: process.env.NODE_ENV === 'development',
    }),
    
    // Módulos de funcionalidad
    AuthModule,
    AvatarModule,
    UserModule,
    WellnessTestModule,
    SessionModule,
    RoutineModule,
    ExecuteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}