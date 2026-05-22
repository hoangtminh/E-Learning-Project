import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { CallType } from '@prisma/client';

export class CreateCallDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsEnum(CallType)
  type?: CallType;

  @IsOptional()
  @IsString()
  classroomId?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
