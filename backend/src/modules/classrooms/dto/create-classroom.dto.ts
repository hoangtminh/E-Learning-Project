import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
