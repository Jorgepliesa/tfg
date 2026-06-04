import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/Item';
import { Keep } from '../entities/Keep';
import { Avatar } from '../entities/Avatar';
import { UserAccount } from '../entities/UserAccount';

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
        @InjectRepository(Keep)
        private keepRepository: Repository<Keep>,
        @InjectRepository(Avatar)
        private avatarRepository: Repository<Avatar>,
        @InjectRepository(UserAccount)
        private userRepository: Repository<UserAccount>,
    ) {}

    async getAllItems() {
        return this.itemRepository.find({ order: { type: 'ASC', name: 'ASC' } });
    }

    async getInventory(userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.keepRepository.find({
            where: { avatar: user.avatar },
            relations: ['itemEntity'],
        });
    }

    async buyItem(userId: number, itemName: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const item = await this.itemRepository.findOne({ where: { name: itemName } });
        if (!item) throw new NotFoundException(`Item "${itemName}" not found`);

        const avatar = await this.avatarRepository.findOne({ where: { id: user.avatar } });
        if (!avatar) throw new NotFoundException('Avatar not found');

        // Check already owned
        const alreadyOwned = await this.keepRepository.findOne({
            where: { avatar: user.avatar, item: itemName },
        });
        if (alreadyOwned) throw new BadRequestException('Item already owned');

        // Check FP
        if (avatar.fp < item.cost) {
            throw new BadRequestException(`Not enough FP. Need ${item.cost}, have ${avatar.fp}`);
        }

        // Deduct FP and save item
        avatar.fp -= item.cost;
        await this.avatarRepository.save(avatar);

        const keep = this.keepRepository.create({
            avatar: user.avatar,
            item: itemName,
            isWearing: false,
        });
        await this.keepRepository.save(keep);

        return { success: true, remainingFp: avatar.fp };
    }

    async equipItem(userId: number, itemName: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const keepEntry = await this.keepRepository.findOne({
            where: { avatar: user.avatar, item: itemName },
            relations: ['itemEntity'],
        });
        if (!keepEntry) throw new NotFoundException('Item not in inventory');

        // Unequip other items of same type
        if (!keepEntry.isWearing) {
            const sameTypeItems = await this.keepRepository.find({
                where: { avatar: user.avatar },
                relations: ['itemEntity'],
            });
            for (const k of sameTypeItems) {
                if (k.itemEntity.type === keepEntry.itemEntity.type && k.isWearing) {
                    k.isWearing = false;
                    await this.keepRepository.save(k);
                }
            }
        }

        keepEntry.isWearing = !keepEntry.isWearing;
        await this.keepRepository.save(keepEntry);

        return { success: true, isWearing: keepEntry.isWearing };
    }
}