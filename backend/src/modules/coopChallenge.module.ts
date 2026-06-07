import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoopChallenge } from "../entities/CoopChallenge";
import { Steps } from "../entities/Steps";
import { CoopChallengeController } from "../controllers/coopChallenge.controller";
import { ChallengeService } from "../services/coopChallenge.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CoopChallenge, Steps]),
    ],
    controllers: [CoopChallengeController],
    providers: [ChallengeService],
    exports: [ChallengeService],
})
export class ChallengeModule { }
