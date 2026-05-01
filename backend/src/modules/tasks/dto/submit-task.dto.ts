import { IsString, IsOptional } from 'class-validator';

export class SubmitTaskDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
