import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecuteService } from '../services/execute.service';
import { ExecuteController } from '../controllers/execute.controller';
import { Execute } from '../entities/Execute';
import { Session } from '../entities/Session';
import { Exercise } from '../entities/Exercise';
import { SessionService } from '../services/session.service';
import { WellnessTest } from '../entities/WellnessTest';

@Module({
  imports: [TypeOrmModule.forFeature([Execute, Session, Exercise, WellnessTest])],
  providers: [ExecuteService, SessionService],
  controllers: [ExecuteController],
})
export class ExecuteModule {}
