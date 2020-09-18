import { MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class UpdateTeamDto {
    @IsNotEmpty()
    @MinLength(2, {
            message: 'Name is too short',
        })
    @MaxLength(20, {
        message: 'Name is too long',
    })
    @ApiProperty({
        description: 'Old team name',
        type: 'string',
        maxLength: 20,
        minLength: 2,
    })
    oldName: string;

    @IsNotEmpty()
    @MinLength(2, {
        message: 'Name is too short',
    })
    @MaxLength(20, {
        message: 'Name is too long',
    })
    @ApiProperty({
        description: 'New team name',
        type: 'string',
        maxLength: 20,
        minLength: 2,
    })
    newName: string;
}
