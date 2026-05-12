import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  /** S3 key of teacher's attachment file */
  @IsOptional()
  @IsString()
  attachmentKey?: string;

  /** Original filename of teacher's attachment */
  @IsOptional()
  @IsString()
  attachmentName?: string;
}
