import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../entities/Item';
import { Keep } from '../entities/Keep';
import { Avatar } from '../entities/Avatar';
import { UserAccount } from '../entities/UserAccount';
import { ShopService } from '../services/shop.service';
import { ShopController } from '../controllers/shop.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Item, Keep, Avatar, UserAccount])],
    controllers: [ShopController],
    providers: [ShopService],
    exports: [ShopService],
})
export class ShopModule {}