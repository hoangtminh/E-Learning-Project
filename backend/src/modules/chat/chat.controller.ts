import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import {
  UpdateConversationDto,
  AddMemberDto,
} from './dto/update-conversation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  createConversation(@Request() req, @Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(req.user.userId, dto);
  }

  @Get('conversations')
  getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.userId);
  }

  @Get('conversations/:id')
  getConversation(@Request() req, @Param('id') id: string) {
    return this.chatService.getConversation(req.user.userId, id);
  }

  @Post('conversations/:id')
  updateConversation(
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.chatService.updateConversation(id, dto.title);
  }

  @Post('conversations/:id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.chatService.addMember(id, dto.userId);
  }

  @Delete('conversations/:id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.chatService.removeMember(id, userId);
  }

  @Delete('conversations/:id')
  deleteConversation(@Param('id') id: string) {
    return this.chatService.removeConversation(id);
  }

  @Post('conversations/:id/join')
  joinConversation(@Request() req, @Param('id') id: string) {
    return this.chatService.joinConversation(req.user.userId, id);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(
      req.user.id,
      id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post('messages')
  sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.userId, dto);
  }

  @Delete('messages/:id')
  deleteMessage(@Request() req, @Param('id') id: string) {
    return this.chatService.deleteMessage(req.user.userId, id);
  }
}
