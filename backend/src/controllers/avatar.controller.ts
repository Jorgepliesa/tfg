import { Body, Controller, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../utils/jwt-auth.guard";
import { AvatarService } from "../services/avatar.service";
import type { Request } from "express";

@ApiTags('Avatar')
@Controller('avatar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AvatarController {
    constructor(private avatarService: AvatarService) { }

    @Patch('add-fp')
    @ApiOperation({ summary: 'Añade (o resta) puntos de esfuerzo al avatar del usuario' })
    @ApiBody({ schema: { example: { amount: 20 } } })
    @ApiResponse({ status: 200, schema: { example: { fp: 120 } } })
    async addFitnessPoints(@Req() req: Request, @Body('amount') amount: number) {
        return this.avatarService.addFitnessPoints(req.user!.id, amount);
    }
}