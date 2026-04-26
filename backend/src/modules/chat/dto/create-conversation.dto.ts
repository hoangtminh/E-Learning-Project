import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ConversationType } from '@prisma/client';

export class CreateConversationDto {
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  classroomId?: string;

  @IsArray()
  @IsString({ each: true })
  participantEmails: string[];
}
