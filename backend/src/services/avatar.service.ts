import { Injectable, NotFoundException } from "@nestjs/common";
import { Avatar } from "../entities/Avatar";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserAccount } from "../entities/UserAccount";


@Injectable()
export class AvatarService {
    constructor(
        @InjectRepository(Avatar)
        private avatarRepository: Repository<Avatar>,
        @InjectRepository(UserAccount)
        private userRepository: Repository<UserAccount>,
    ) {}

    // TODO: comprar items, equipar etc...
}