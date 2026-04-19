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
}
