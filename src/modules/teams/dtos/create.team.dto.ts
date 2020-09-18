import { MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateTeamDto {
    @IsNotEmpty()
    @MinLength(2, {
            message: 'Name is too short',
        })
    @MaxLength(20, {
        message: 'Name is too long',
    })
    @ApiProperty({
        description: 'Team name',
        type: 'string',
        maxLength: 20,
        minLength: 2,
    })
    name: string;
}
