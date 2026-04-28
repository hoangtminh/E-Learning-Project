import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum ContentType {
  video = 'video',
  file = 'file',
  image = 'image',
  text = 'text',
}

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @IsOptional()
  @IsString()
  contentUrl?: string;

  @IsOptional()
  @IsString()
  rawText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsString()
  @IsNotEmpty()
  status: string;
}
