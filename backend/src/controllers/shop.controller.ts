import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/jwt-auth.guard';
import { ShopService } from '../services/shop.service';
import type { Request } from 'express';

@ApiTags('Shop')
@Controller('shop')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ShopController {
    constructor(private shopService: ShopService) {}

    @Get('items')
    @ApiResponse({ status: 200, description: 'All items in the shop' })
    async getItems() {
        return this.shopService.getAllItems();
    }

    @Get('inventory')
    @ApiResponse({ status: 200, description: 'Items owned by the user avatar' })
    async getInventory(@Req() req: Request) {
        return this.shopService.getInventory(req.user!.id);
    }

    @Post('buy/:itemName')
    @ApiResponse({ status: 201, description: 'Item purchased' })
    async buyItem(@Req() req: Request, @Param('itemName') itemName: string) {
        return this.shopService.buyItem(req.user!.id, itemName);
    }

    @Post('equip/:itemName')
    @ApiResponse({ status: 200, description: 'Item equipped/unequipped' })
    async equipItem(@Req() req: Request, @Param('itemName') itemName: string) {
        return this.shopService.equipItem(req.user!.id, itemName);
    }
}