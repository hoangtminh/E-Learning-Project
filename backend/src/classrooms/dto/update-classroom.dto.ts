import { IsOptional, IsString } from 'class-validator';

export class UpdateClassroomDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  inviteCode?: string;
}
