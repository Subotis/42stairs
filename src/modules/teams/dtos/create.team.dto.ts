import { MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateTeamDto {
    @IsNotEmpty()
    @MinLength(2, {
            message: 'Name is too short',
        })
    @MaxLength(20, {
        message: 'Name is too long',
    })
    name: string;
}
