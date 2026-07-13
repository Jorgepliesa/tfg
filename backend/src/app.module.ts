import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
import { Has } from './entities/Has';
import { Audiovisual } from './entities/Audiovisual';
import { MuscleGroup } from './entities/MuscleGroup';
import { Equipment } from './entities/Equipment';
import { MeasurementParameter } from './entities/MeasurementParameter';
import { WellnessTestModule } from './modules/wellnessTest.module';
import { SessionModule } from './modules/session.module';
import { ShopModule } from './modules/shop.modules';
import { MemorialModule } from './modules/memorial.module';
import { ChallengeModule } from './modules/coopChallenge.module';
import { ClinicalProfile } from './entities/ClinicalProfile';
import { ClinicalProfileModule } from './modules/clinicalProfile.module';
import { SupervisorNote } from './entities/SupervisorNote';
import { Contraindication } from './entities/Contraindication';

// Importar entidades omop
import { OmopMeasurement } from './entities/omop/OmopMeasurement';
import { OmopDailySummary } from './entities/omop/OmopDailySummary';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Servir imágenes estáticas desde la carpeta uploads/
    // Accesibles en: http://host:3000/uploads/<subcarpeta>/<archivo>
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
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
        ClinicalProfile,
        SupervisorNote,
        Contraindication,
      ],
      synchronize: false, // ¡IMPORTANTE! false en producción para no perder datos TODO
      logging: process.env.NODE_ENV === 'development',
    }),
    // app.module.ts
    TypeOrmModule.forRoot({
      name: 'omop',  // nombre de la conexión
      type: 'postgres',
      url: process.env.OMOP_DATABASE_URL || process.env.DATABASE_URL,  // misma BD o externa
      schema: 'omop_modified',  // solo lees de este schema
      synchronize: false,        // nunca — no es tu esquema
      entities: [OmopMeasurement, OmopDailySummary],
    }),

    // Módulos de funcionalidad
    AuthModule,
    AvatarModule,
    UserModule,
    WellnessTestModule,
    SessionModule,
    RoutineModule,
    ExecuteModule,
    ShopModule,
    MemorialModule,
    ChallengeModule,
    ClinicalProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }