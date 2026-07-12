import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalProfileController } from '../controllers/clinicalProfile.controller';
import { ClinicalProfileService } from '../services/clinicalProfile.service';
import { ClinicalProfile } from '../entities/ClinicalProfile';
import { Session } from '../entities/Session';
import { Steps } from '../entities/Steps';
import { WellnessTest } from '../entities/WellnessTest';
import { Execute } from '../entities/Execute';
import { UserAccount } from '../entities/UserAccount';
import { SupervisorNote } from '../entities/SupervisorNote';
import { Contraindication } from '../entities/Contraindication';

@Module({
    imports: [TypeOrmModule.forFeature([
        ClinicalProfile, Session, Steps, WellnessTest, Execute, UserAccount, SupervisorNote, Contraindication
    ])],
    controllers: [ClinicalProfileController],
    providers: [ClinicalProfileService],
    exports: [ClinicalProfileService],
})
export class ClinicalProfileModule { }