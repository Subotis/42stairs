import { MinLength, MaxLength, IsNotEmpty, IsInt, IsPositive, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMatchDto {
    @IsNotEmpty()
    @MinLength(2, {
        message: 'homeTeam name is too short',
    })
    @MaxLength(20, {
        message: 'homeTeam name is too long',
    })
    @ApiProperty({
        description: 'Home team name',
        type: 'string',
        maxLength: 20,
        minLength: 2,
    })
    homeTeam: string;

    @MinLength(2, {
        message: 'awayTeam name is too short',
    })
    @MaxLength(20, {
        message: 'awayTeam name is too long',
    })
    @IsNotEmpty()
    @ApiProperty({
        description: 'Away team name',
        type: 'string',
        maxLength: 20,
        minLength: 2,
    })
    awayTeam: string;

    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(10)
    @Matches(/^[0-2][0-9]-[0-1][0-2]-[0-9]{4}$/gm,{
        message: "date should be in 'DD-MM-YYYY' format",
    })
    @ApiProperty({
            description: 'Date of match',
            type: 'string',
            pattern: '/^[0-2][0-9]-[0-1][0-2]-[0-9]{4}$/gm'
    })
    date: string;

    @IsInt()
    @IsPositive()
    @ApiProperty({
        description: 'Home team score',
        type: 'number',
        minimum: 0
    })
    HTS: number;

    @IsInt()
    @IsPositive()
    @ApiProperty({
        description: 'Away team score',
        type: 'number',
        minimum: 0
    })
    ATS: number;
}
