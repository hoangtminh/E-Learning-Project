import { IsString, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UserAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  @IsOptional()
  textAnswer?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedOptionIds?: string[];
}

export class SubmitQuizDto {
  @IsNumber()
  @IsOptional()
  timeSpent?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAnswerDto)
  answers: UserAnswerDto[];
}
