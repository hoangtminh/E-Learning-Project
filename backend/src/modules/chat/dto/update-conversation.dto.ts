import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[];
}

export class AddMemberDto {
  @IsString()
  userId: string;
}
