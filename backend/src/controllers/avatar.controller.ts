import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { AvatarService } from "../services/avatar.service";
import { JwtAuthGuard } from "../utils/jwt-auth.guard";

@ApiTags('Avatar')
@Controller('avatar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AvatarController {
}