import { IsArray, IsOptional, IsString, IsBoolean, IsDateString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-quiz.dto';

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[];
}

export class ShareQuizDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  emails?: string[];

  @IsString()
  @IsOptional()
  classroomId?: string;
}
