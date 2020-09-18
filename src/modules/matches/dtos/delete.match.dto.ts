import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class DeleteMatchDto {
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
}
