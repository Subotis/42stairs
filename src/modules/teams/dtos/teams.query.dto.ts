import { MaxLength, IsNotEmpty, IsOptional } from 'class-validator';

export class TeamsQueryDto {
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(20, {
        message: 'Filter is too long',
    })
    filter: string;
}
