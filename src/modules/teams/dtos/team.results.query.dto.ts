import { MaxLength, IsNotEmpty, MinLength } from 'class-validator';

export class TeamResultsQueryDto {
    @IsNotEmpty()
    @MinLength(2, {
        message: 'Name is too short',
    })
    @MaxLength(20, {
        message: 'Name is too long',
    })
    team: string;
}
