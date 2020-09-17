import {MinLength, MaxLength, IsNotEmpty, IsInt, Matches} from 'class-validator';

export class CreateMatchDto {
    @IsNotEmpty()
    @MinLength(2, {
        message: 'homeTeam name is too short',
    })
    @MaxLength(20, {
        message: 'homeTeam name is too long',
    })
    homeTeam: string
    @MinLength(2, {
        message: 'awayTeam name is too short',
    })
    @MaxLength(20, {
        message: 'awayTeam name is too long',
    })
    @IsNotEmpty()
    awayTeam: string
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(10)
    @Matches(/^[0-2][0-9]-[0-1][0-2]-[0-9]{4}$/gm,{
        message: "date should be in 'DD-MM-YYYY' format",
    })
    date: string
    @IsInt()
    HTS: number
    @IsInt()
    ATS: number
}
