import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class DeleteTeamDto {
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
