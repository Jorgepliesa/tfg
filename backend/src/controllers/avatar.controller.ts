import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../utils/jwt-auth.guard";

@ApiTags('Avatar')
@Controller('avatar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AvatarController {
}