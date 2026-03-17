import { TypeOrmModule } from "@nestjs/typeorm";
import { AvatarController } from "../controllers/avatar.controller";
import { Avatar } from "../entities/Avatar";
import { AvatarService } from "../services/avatar.service";
import { Module } from "@nestjs/common";
import { UserAccount } from "../entities/UserAccount";

@Module({
    imports: [
        TypeOrmModule.forFeature([Avatar, UserAccount]),
    ],
    controllers: [AvatarController],
    providers: [AvatarService],
    exports: [AvatarService],
})
export class AvatarModule {}