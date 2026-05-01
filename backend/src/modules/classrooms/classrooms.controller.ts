import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { IsString, IsNotEmpty } from 'class-validator';

class JoinByCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  private getUserId(req: any): string {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return userId;
  }

  @Post()
  create(@Req() req: any, @Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomsService.create(
      this.getUserId(req),
      createClassroomDto,
    );
  }

  // NOTE: This route must come BEFORE ':id' to avoid route conflict
  @Post('join-by-code')
  joinByCode(@Req() req: any, @Body() body: JoinByCodeDto) {
    return this.classroomsService.joinByCode(this.getUserId(req), body.code);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.classroomsService.findAll(this.getUserId(req));
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.classroomsService.findOne(id, this.getUserId(req));
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ) {
    return this.classroomsService.update(
      id,
      this.getUserId(req),
      updateClassroomDto,
    );
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.classroomsService.remove(id, this.getUserId(req));
  }

  @Post(':id/courses/:courseId')
  linkCourse(
    @Req() req: any,
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.classroomsService.linkCourse(this.getUserId(req), id, courseId);
  }

  @Delete(':id/courses/:courseId')
  unlinkCourse(
    @Req() req: any,
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.classroomsService.unlinkCourse(this.getUserId(req), id, courseId);
  }
}
