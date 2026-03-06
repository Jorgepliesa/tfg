import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsNumber, IsPositive } from 'class-validator';

export class LoginDto {
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    @ApiProperty({
        example: 821011,
        description: 'The unique identifier of the user account',
    })
    id: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @ApiProperty({
        example: 'password123',
        description: 'The password of the user account',
    })
    password: string;
}