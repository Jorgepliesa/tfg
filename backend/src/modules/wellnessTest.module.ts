import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WellnessTest } from '../entities/WellnessTest';
import { WellnessTestController } from '../controllers/wellnessTest.controller';
import { WellnessTestService } from '../services/wellnessTest.service';


@Module({
  imports: [TypeOrmModule.forFeature([WellnessTest])],
  controllers: [WellnessTestController],
  providers: [WellnessTestService],
})
export class WellnessTestModule {}