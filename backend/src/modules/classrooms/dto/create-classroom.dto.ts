import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  inviteCode?: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;
}
