import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoopChallenge } from "../entities/CoopChallenge";
import { Steps } from "../entities/Steps";
import { CoopChallengeController } from "../controllers/coopChallenge.controller";
import { ChallengeService } from "../services/coopChallenge.service";
import { Memorial } from "../entities/Memorial";
import { Complete } from "../entities/Complete";
import { Has } from "../entities/Has";
import { UserAccount } from "../entities/UserAccount";

@Module({
    imports: [
        TypeOrmModule.forFeature([CoopChallenge, Steps, Memorial, UserAccount, Complete, Has]),
    ],
    controllers: [CoopChallengeController],
    providers: [ChallengeService],
    exports: [ChallengeService],
})
export class ChallengeModule { }
