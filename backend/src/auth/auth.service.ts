import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserAccount } from "../entities/UserAccount";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "./dto/login.dto";
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserAccount)
        private userRepository: Repository<UserAccount>,
        private jwtService: JwtService,
    ) {}

    async validateUser(id: number, password: string): Promise<UserAccount | null> {
        const user = await this.userRepository.findOne({ 
            where: { id },
            relations: ['avatarEntity'],
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;
        
        return user;
    }

    async login(loginDto: LoginDto){
        const user = await this.validateUser(loginDto.id, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        //user.lastLogin = new Date(); // lo necesito?
        await this.userRepository.save(user);

        const payload = { sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { 
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' as any,
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                streak: user.streak,
                avatar: user.avatarEntity ? {
                    id: user.avatarEntity.id,
                    fp: user.avatarEntity.fp,
                } : null,
            },
        };
    }
    
    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            
            const newAccessToken = this.jwtService.sign({ 
                sub: payload.sub, 
            });

            return { accessToken: newAccessToken };
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async verifyParental(userId: number, password: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) return false;
        return await bcrypt.compare(password, user.password);
    }
}