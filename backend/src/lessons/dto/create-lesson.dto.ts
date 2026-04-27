import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum ContentType {
  video_embed = 'video_embed',
  file_docx = 'file_docx',
  file_pdf = 'file_pdf',
  image_png = 'image_png',
  image_jpg = 'image_jpg',
  text_content = 'text_content',
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
  orderIndex?: number;
}
