import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCallDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}
