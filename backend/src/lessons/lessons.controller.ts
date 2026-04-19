import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post('sections/:sectionId/lessons')
  create(
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.lessonsService.create(sectionId, dto);
  }

  @Public()
  @Get('sections/:sectionId/lessons')
  findAllBySection(@Param('sectionId') sectionId: string) {
    return this.lessonsService.findAllBySection(sectionId);
  }

  @Patch('lessons/:id')
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.lessonsService.update(id, dto);
  }

  @Delete('lessons/:id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}
