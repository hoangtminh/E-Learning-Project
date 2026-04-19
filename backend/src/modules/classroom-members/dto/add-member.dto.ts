import { IsArray, IsString, IsUUID, ArrayNotEmpty } from 'class-validator';

export class AddMemberDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  userIds: string[];
}
