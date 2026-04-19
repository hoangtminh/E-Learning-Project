import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller()
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post('courses/:courseId/sections')
  create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.sectionsService.create(courseId, dto);
  }

  @Public()
  @Get('courses/:courseId/sections')
  findAllByCourse(@Param('courseId') courseId: string) {
    return this.sectionsService.findAllByCourse(courseId);
  }

  @Patch('sections/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.sectionsService.update(id, dto);
  }

  @Delete('sections/:id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}
