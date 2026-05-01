import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ClassroomMembersService } from './classroom-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { PendingMemberDto } from './dto/pending-member.dto';
import { AddMembersResponseDto } from './dto/add-members-response.dto';
import { ApproveAllResponseDto } from './dto/approve-all-response.dto';

@Controller('classrooms/:classroomId')
export class ClassroomMembersController {
  constructor(private readonly membersService: ClassroomMembersService) {}

  private getUserId(req: any): string {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return userId;
  }

  @Post('join')
  joinClassroom(@Req() req: any, @Param('classroomId') classroomId: string) {
    return this.membersService.joinClassroom(this.getUserId(req), classroomId);
  }

  @Post('members')
  addMember(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<AddMembersResponseDto> {
    return this.membersService.addMembers(
      this.getUserId(req),
      classroomId,
      addMemberDto.userIds,
    );
  }

  @Patch('members/:userId/approve')
  approveMember(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.membersService.approveMember(
      this.getUserId(req),
      classroomId,
      targetUserId,
    );
  }

  @Patch('members/approve-all')
  approveAllMembers(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
  ): Promise<ApproveAllResponseDto> {
    return this.membersService.approveAllMembers(
      this.getUserId(req),
      classroomId,
    );
  }

  @Get('members/pending')
  getPendingMembers(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
  ): Promise<PendingMemberDto[]> {
    return this.membersService.getPendingMembers(
      this.getUserId(req),
      classroomId,
    );
  }

  @Delete('members/pending/:userId')
  rejectMember(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.membersService.rejectMember(
      this.getUserId(req),
      classroomId,
      targetUserId,
    );
  }

  @Get('members')
  getMembers(@Req() req: any, @Param('classroomId') classroomId: string) {
    return this.membersService.getMembers(this.getUserId(req), classroomId);
  }

  @Delete('members/:userId')
  removeMember(
    @Req() req: any,
    @Param('classroomId') classroomId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.membersService.removeMember(
      this.getUserId(req),
      classroomId,
      targetUserId,
    );
  }
}
