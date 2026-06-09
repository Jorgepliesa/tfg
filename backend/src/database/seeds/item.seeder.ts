import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Item, ItemType } from '../../entities/Item';

export class ItemSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Item);

        const items = [
            { name: 'Casco de campeón', type: ItemType.HEAD, image: '', cost: 100 },
            { name: 'Corona dorada', type: ItemType.HEAD, image: '', cost: 250 },
            { name: 'Camiseta deportiva', type: ItemType.BODY, image: '', cost: 80 },
            { name: 'Capa de superhéroe', type: ItemType.BODY, image: '', cost: 300 },
            { name: 'Guantes de boxeo', type: ItemType.ARMS, image: '', cost: 120 },
            { name: 'Brazaletes de campeón', type: ItemType.ARMS, image: '', cost: 90 },
            { name: 'Pantalón deportivo', type: ItemType.LEGS, image: '', cost: 70 },
            { name: 'Mallas de velocidad', type: ItemType.LEGS, image: '', cost: 150 },
            { name: 'Zapatillas rocket', type: ItemType.FEET, image: '', cost: 200 },
            { name: 'Botas de montaña', type: ItemType.FEET, image: '', cost: 180 },
            { name: 'Gafas de sol', type: ItemType.FACE, image: '', cost: 60 },
            { name: 'Máscara de héroe', type: ItemType.FACE, image: '', cost: 220 },
            { name: 'Mochila aventurera', type: ItemType.ACCESSORY, image: '', cost: 130 },
            { name: 'Medalla de oro', type: ItemType.ACCESSORY, image: '', cost: 400 },
        ];

        for (const item of items) {
            const exists = await repo.findOne({ where: { name: item.name } });
            if (!exists) {
                await repo.save(repo.create(item));
                console.log(`  ✓ Item: ${item.name}`);
            }
        }
    }
}