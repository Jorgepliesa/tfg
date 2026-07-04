import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemorialController } from '../controllers/memorial.controller';
import { MemorialService } from '../services/memorial.service';
import { Memorial } from '../entities/Memorial';
import { Has } from '../entities/Has';

@Module({
    imports: [TypeOrmModule.forFeature([Memorial, Has])],
    controllers: [MemorialController],
    providers: [MemorialService],
    exports: [MemorialService],
})
export class MemorialModule { }