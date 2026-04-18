import { Module } from "@nestjs/common";
import { SessionService } from "../services/session.service";
import { SessionController } from "../controllers/session.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Session } from "../entities/Session";
import { WellnessTest } from "../entities/WellnessTest";
import { Execute } from "../entities/Execute";

@Module({
    imports: [TypeOrmModule.forFeature([Session, WellnessTest, Execute])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}