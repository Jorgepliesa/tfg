import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineService } from '../services/routine.service';
import { RoutineController } from '../controllers/routine.controller';
import { Routine } from '../entities/Routine';
import { Plan } from '../entities/Plan';
import { Exercise } from '../entities/Exercise';
import { Session } from '../entities/Session';
import { Execute } from '../entities/Execute';
import { WellnessTest } from '../entities/WellnessTest';
import { ClinicalProfile } from '../entities/ClinicalProfile';
import { Contraindication } from '../entities/Contraindication';

@Module({
  imports: [TypeOrmModule.forFeature([Routine, Plan, Exercise, Session, WellnessTest, Execute, ClinicalProfile, Contraindication])],
  providers: [RoutineService],
  controllers: [RoutineController],
})
export class RoutineModule { }
