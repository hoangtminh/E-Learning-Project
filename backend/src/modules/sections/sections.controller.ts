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
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Roles('instructor', 'admin')
  @Post('courses/:courseId/sections')
  create(@Param('courseId') courseId: string, @Body() dto: CreateSectionDto) {
    return this.sectionsService.create(courseId, dto);
  }

  @Public()
  @Get('courses/:courseId/sections')
  findAllByCourse(@Param('courseId') courseId: string) {
    return this.sectionsService.findAllByCourse(courseId);
  }

  @Roles('instructor', 'admin')
  @Patch('sections/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.sectionsService.update(id, dto);
  }

  @Roles('instructor', 'admin')
  @Delete('sections/:id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}
