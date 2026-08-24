import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAccount } from "../entities/UserAccount";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";
import { Avatar } from "../entities/Avatar";
import { StepsModule } from "./steps.module";
import { ClinicalProfileModule } from "./clinicalProfile.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserAccount, Avatar]),
        StepsModule,
        ClinicalProfileModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}