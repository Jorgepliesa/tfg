import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, IsDateString, Min, Max, IsNotEmpty } from 'class-validator';
import { Gender } from '../entities/ClinicalProfile';

export class ClinicalProfileCreateDto {
    @ApiProperty({ example: 9 })
    @IsInt() @Min(0) @Max(99)
    age: number;

    @ApiProperty({ enum: Gender })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ example: 132 })
    @IsInt() @Min(0) @Max(300)
    height: number;

    @ApiProperty({ example: 28 })
    @IsInt() @Min(0) @Max(999)
    weight: number;

    @ApiProperty({ example: '2016-03-14' })
    @IsDateString()
    birthDate: string;

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