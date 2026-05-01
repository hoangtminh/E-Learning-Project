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
  UseGuards,
} from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { IsString, IsNotEmpty } from 'class-validator';
import { AssignCourseGuard } from './guards/assign-course.guard';

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

  @Get('my-pending')
  getMyPendingClassrooms(@Req() req: any) {
    return this.classroomsService.getMyPendingClassrooms(this.getUserId(req));
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

  @UseGuards(AssignCourseGuard)
  @Post(':id/courses/:courseId')
  linkCourse(
    @Req() req: any,
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.classroomsService.assignCourseToClass(courseId, id, this.getUserId(req));
  }

  @UseGuards(AssignCourseGuard)
  @Delete(':id/courses/:courseId')
  unlinkCourse(
    @Req() req: any,
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.classroomsService.unlinkCourse(this.getUserId(req), id, courseId);
  }
}
