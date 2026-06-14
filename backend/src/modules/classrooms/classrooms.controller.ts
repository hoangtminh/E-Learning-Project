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
  BadRequestException,
} from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { IsString, IsNotEmpty } from 'class-validator';

import { Roles } from '../../common/decorators/roles.decorator';

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

  @Roles('instructor', 'admin')
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


  // --- POSTS ---
  @Get(':id/posts')
  getPosts(@Req() req: any, @Param('id') id: string) {
    return this.classroomsService.getPosts(id, this.getUserId(req));
  }

  @Post(':id/posts')
  createPost(
    @Req() req: any,
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    if (!content) throw new BadRequestException('Content is required');
    return this.classroomsService.createPost(id, this.getUserId(req), content);
  }

  @Patch(':id/posts/:postId')
  updatePost(
    @Req() req: any,
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body('content') content: string,
  ) {
    if (!content) throw new BadRequestException('Content is required');
    return this.classroomsService.updatePost(
      id,
      postId,
      this.getUserId(req),
      content,
    );
  }

  @Delete(':id/posts/:postId')
  deletePost(
    @Req() req: any,
    @Param('id') id: string,
    @Param('postId') postId: string,
  ) {
    return this.classroomsService.deletePost(id, postId, this.getUserId(req));
  }

  // --- COMMENTS ---
  @Get(':id/posts/:postId/comments')
  getComments(
    @Req() req: any,
    @Param('id') id: string,
    @Param('postId') postId: string,
  ) {
    return this.classroomsService.getComments(id, postId, this.getUserId(req));
  }

  @Post(':id/posts/:postId/comments')
  createComment(
    @Req() req: any,
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body('content') content: string,
  ) {
    if (!content) throw new BadRequestException('Content is required');
    return this.classroomsService.createComment(
      id,
      postId,
      this.getUserId(req),
      content,
    );
  }

  @Patch(':id/comments/:commentId')
  updateComment(
    @Req() req: any,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body('content') content: string,
  ) {
    if (!content) throw new BadRequestException('Content is required');
    return this.classroomsService.updateComment(
      id,
      commentId,
      this.getUserId(req),
      content,
    );
  }

  @Delete(':id/comments/:commentId')
  deleteComment(
    @Req() req: any,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return this.classroomsService.deleteComment(
      id,
      commentId,
      this.getUserId(req),
    );
  }
}
