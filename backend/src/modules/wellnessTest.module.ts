import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WellnessTest } from '../entities/WellnessTest';
import { WellnessTestController } from '../controllers/wellnessTest.controller';
import { WellnessTestService } from '../services/wellnessTest.service';
import { Session } from '../entities/Session';


@Module({
  imports: [TypeOrmModule.forFeature([WellnessTest, Session])],
  controllers: [WellnessTestController],
  providers: [WellnessTestService],
})
export class WellnessTestModule {}