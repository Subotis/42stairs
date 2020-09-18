import { MaxLength, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class TeamsQueryDto {
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(20, {
        message: 'Filter is too long',
    })
    @ApiPropertyOptional(
        {
            description: 'Query value',
            type: 'string',
            maxLength: 20,
            minLength: 0,
        }
    )
    filter?: string;
}
