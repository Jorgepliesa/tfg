import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { UserAccount } from "../entities/UserAccount";
import { InjectRepository } from "@nestjs/typeorm";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UserAccount)
        private userRepository: Repository<UserAccount>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key',
        });
    }
    
    async validate(payload: any) {
        const user = await this.userRepository.findOne({ 
            where: { id: payload.sub },
            relations: ['avatarEntity'],
        });

        if(!user) throw new UnauthorizedException('User not found');

        return {
            id: user.id,
            avatarId: user.avatarEntity.id, // no se si me hace falta
            avatarEntity: user.avatarEntity,
        };
    }
}