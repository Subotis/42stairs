import {MinLength, MaxLength, IsNotEmpty} from 'class-validator';

export class UpdateTeamDto {
    @IsNotEmpty()
    @MinLength(2, {
            message: 'Name is too short',
        })
    @MaxLength(20, {
        message: 'Name is too long',
    })
    oldName: string;
    @IsNotEmpty()
    @MinLength(2, {
        message: 'Name is too short',
    })
    @MaxLength(20, {
        message: 'Name is too long',
    })
    newName: string;
}
