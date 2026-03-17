import { Injectable, NotFoundException } from "@nestjs/common";
import { UserAccount } from "../entities/UserAccount";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { StepsService } from "./steps.service";
import { Avatar } from "../entities/Avatar";


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserAccount)
        private userRepository: Repository<UserAccount>,
        @InjectRepository(Avatar)
        private avatarRepository: Repository<Avatar>,
        private stepsService: StepsService,
    ) {}

    // TODO: WIP
    async getUserProfile(id: number): Promise<{ id: number; todaySteps: number; streak: number }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        const todaySteps = await this.getTodaySteps(id);
        return {
            id: user.id,
            todaySteps,
            streak: user.streak,
        };
    }

    async getUserStreak(id: number): Promise<number> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return user.streak;
    }

    // Delegar a StepsService
    async getTodaySteps(userId: number): Promise<number> {
        return await this.stepsService.getTodaySteps(userId);
    }


    async getFitnessPoints(userId: number): Promise<number> {
        // Primero obtenemos el usuario para obtener su avatar
        const user = await this.userRepository.findOne({ where: { id: userId } }); // Aqui es el join
        if (!user) throw new NotFoundException('User not found');
        if (!user.avatar) throw new NotFoundException('Avatar not found for user');

        // Ya podemos obtener el fp del avatar
        const avatar = await this.avatarRepository.findOne({ where: { id: user.avatar } });
        if (!avatar) throw new NotFoundException('Avatar not found');
        return avatar.fp;
    }
}