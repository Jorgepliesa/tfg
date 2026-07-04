import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memorial } from '../entities/Memorial';
import { Has } from '../entities/Has';

@Injectable()
export class MemorialService {
    constructor(
        @InjectRepository(Memorial)
        private memorialRepository: Repository<Memorial>,
        @InjectRepository(Has)
        private hasRepository: Repository<Has>,
    ) { }

    async getMemorialsWithStatus(userId: number, baseUrl: string) {
        const allMemorials = await this.memorialRepository.find({
            order: { name: 'ASC' },
        });

        const unlocked = await this.hasRepository.find({
            where: { userId },
        });

        const unlockedNames = new Set(unlocked.map(h => h.memorial));

        return allMemorials.map(m => {
            // Si la imagen es una ruta relativa (ej: uploads/memorials/file.png),
            // concatenamos la baseUrl del servidor
            let imageUrl = m.image;
            if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                imageUrl = `${baseUrl}/${imageUrl}`;
            }

            return {
                name: m.name,
                description: m.description,
                image: imageUrl,
                unlocked: unlockedNames.has(m.name),
            };
        });
    }
}