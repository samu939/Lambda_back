import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator';

export class LogInUserEntryInfraDto {
    
    @ApiProperty({ example: 'carlonsozoa@gmail.com' })
    @IsString()
    username: string
    
    @ApiProperty({ example: 'arrozconcanela22' })
    @IsString()
    password: string
  
}