import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Steps } from "../entities/Steps";
import { StepsController } from "../controllers/steps.controller";
import { StepsService } from "../services/steps.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([Steps]),
    ],
    controllers: [StepsController],
    providers: [StepsService],
    exports: [StepsService],
})
export class StepsModule {}