import { IsString, IsOptional } from 'class-validator';

export class SubmitTaskDto {
  @IsOptional()
  @IsString()
  content?: string;

  /** S3 URL of the uploaded submission file (set after client-side S3 upload) */
  @IsOptional()
  @IsString()
  fileUrl?: string;

  /** Original filename for display purposes */
  @IsOptional()
  @IsString()
  fileName?: string;
}
