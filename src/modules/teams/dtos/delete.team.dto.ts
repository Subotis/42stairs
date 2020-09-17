import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class DeleteTeamDto {
    @IsNotEmpty()
    @MinLength(2, {
        message: 'Name is too short',
    })
    @MaxLength(20, {
        message: 'Name is too long',
    })
    name: string;
}
