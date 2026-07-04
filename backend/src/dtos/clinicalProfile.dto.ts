import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, IsDateString, Min, Max, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { BiologicalSex, TannerStage } from '../entities/ClinicalProfile';

export class ClinicalProfileCreateDto {
    @ApiProperty({ example: 9 })
    @IsInt() @Min(0) @Max(99)
    age: number;

    @ApiProperty({ enum: BiologicalSex, description: 'Sexo biológico' })
    @IsEnum(BiologicalSex)
    biologicalSex: BiologicalSex;

    @ApiProperty({
        enum: TannerStage,
        required: false,
        description: 'Estadio de Tanner (determinado por el médico)',
    })
    @IsOptional()
    @IsEnum(TannerStage)
    tannerStage?: TannerStage;

    @ApiProperty({ example: 132 })
    @IsInt() @Min(0) @Max(300)
    height: number;

    @ApiProperty({ example: 28 })
    @IsInt() @Min(0) @Max(999)
    weight: number;

    @ApiProperty({ example: '2016-03-14' })
    @IsDateString()
    birthDate: string;

    @ApiProperty({ example: 18.4, required: false, description: 'IMC' })
    @IsOptional()
    @IsNumber() @Min(0) @Max(60)
    bmi?: number;

    @ApiProperty({ example: 65, required: false, description: 'Percentil de IMC' })
    @IsOptional()
    @IsNumber() @Min(0) @Max(100)
    bmiPercentile?: number;

    @ApiProperty({
        required: false,
        description: 'Enfermedades o patologías previas al diagnóstico del cáncer',
    })
    @IsOptional() @IsString()
    priorConditions?: string;

    @ApiProperty({
        required: false,
        description: 'Comorbilidades actuales no relacionadas con el cáncer',
    })
    @IsOptional() @IsString()
    currentComorbidities?: string;

    @ApiProperty({
        required: false,
        description: 'Antecedentes familiares relevantes',
    })
    @IsOptional() @IsString()
    familyHistory?: string;

    @ApiProperty({ example: 'LLA B-cell' })
    @IsString() @IsNotEmpty()
    diagnosis: string;

    @ApiProperty({ example: '2025-02-01' })
    @IsDateString()
    treatmentEndDate: string;

    @ApiProperty({ example: 'Hospital La Paz' })
    @IsString() @IsNotEmpty()
    hospital: string;
}

export class ClinicalProfileUpdateDto extends PartialType(ClinicalProfileCreateDto) { }