import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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
    ) { }

    private async getAvatarForUser(userId: number): Promise<Avatar> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        const avatar = await this.avatarRepository.findOne({ where: { id: user.avatar } });
        if (!avatar) throw new NotFoundException('Avatar not found');
        return avatar;
    }

    /**
     * Suma (o resta) puntos de esfuerzo al avatar del usuario.
     * El CÁLCULO de cuántos puntos se ganan vive en el frontend (fijo por ahora,
     * ej. 20 por sesión); este método solo persiste el resultado de forma segura.
     */
    async addFitnessPoints(userId: number, amount: number): Promise<{ fp: number }> {
        const avatar = await this.getAvatarForUser(userId);
        const newFp = avatar.fp + amount;
        if (newFp < 0) throw new BadRequestException('Fitness points cannot go below 0');
        avatar.fp = newFp;
        await this.avatarRepository.save(avatar);
        return { fp: avatar.fp };
    }
}