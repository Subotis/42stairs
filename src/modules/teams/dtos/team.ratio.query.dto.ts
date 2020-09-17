import {MinLength, MaxLength, IsNotEmpty} from 'class-validator';

export class TeamRatioQueryDto {
    @IsNotEmpty()
    @MinLength(2, {
        message: 'Name is too short',
    })
    @MaxLength(20, {
        message: 'Name is too long',
    })
    team: string;
}
