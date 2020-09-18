import { MinLength, MaxLength, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class MatchResultsQueryDto {
    @IsOptional()
    @IsNotEmpty()
    @MinLength(2, {
        message: 'homeTeam name is too short',
    })
    @MaxLength(20, {
        message: 'homeTeam name is too long',
    })
    @ApiPropertyOptional({
        description: 'Team one name',
        type: 'string',
        maxLength: 20,
        minLength: 2,
    })
    teamOne?: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(2, {
        message: 'teamOne name is too short',
    })
    @MaxLength(20, {
        message: 'teamTwoTeam name is too long',
    })
    @ApiPropertyOptional({
            description: 'Team two name',
            type: 'string',
            maxLength: 20,
            minLength: 2,
    })
    teamTwo?: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(10)
    @Matches(/^[0-2][0-9]-[0-1][0-2]-[0-9]{4}$/gm,{
        message: "date should be in 'DD-MM-YYYY' format",
    })
    @ApiPropertyOptional({
            description: 'Date of match',
            type: 'string',
            pattern: '/^[0-2][0-9]-[0-1][0-2]-[0-9]{4}$/gm'
    })
    date?: string;
}
