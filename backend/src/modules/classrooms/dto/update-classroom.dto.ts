import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateClassroomDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
