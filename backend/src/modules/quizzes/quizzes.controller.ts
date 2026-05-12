import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto, ShareQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  private getUserId(req: any): string {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return userId;
  }

  @Post()
  createQuiz(@Req() req: any, @Body() dto: CreateQuizDto) {
    console.log(dto);
    return this.quizzesService.createQuiz(this.getUserId(req), dto);
  }

  @Get('created')
  getCreatedQuizzes(@Req() req: any) {
    return this.quizzesService.getCreatedQuizzes(this.getUserId(req));
  }

  @Get('joined')
  getJoinedQuizzes(@Req() req: any) {
    return this.quizzesService.getJoinedQuizzes(this.getUserId(req));
  }

  @Get('public')
  getPublicQuizzes(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.quizzesService.getPublicQuizzes(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  getQuiz(@Req() req: any, @Param('id') id: string) {
    return this.quizzesService.getQuiz(this.getUserId(req), id);
  }

  @Patch(':id')
  updateQuiz(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzesService.updateQuiz(this.getUserId(req), id, dto);
  }

  @Delete(':id')
  deleteQuiz(@Req() req: any, @Param('id') id: string) {
    return this.quizzesService.deleteQuiz(this.getUserId(req), id);
  }

  @Post(':id/share')
  shareQuiz(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ShareQuizDto,
  ) {
    return this.quizzesService.shareQuiz(this.getUserId(req), id, dto);
  }

  @Post(':id/submit')
  submitQuiz(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizzesService.submitQuiz(this.getUserId(req), id, dto);
  }

  @Get(':id/submissions')
  getQuizSubmissions(@Req() req: any, @Param('id') id: string) {
    return this.quizzesService.getQuizSubmissions(this.getUserId(req), id);
  }

  @Get(':id/submissions/:submissionId')
  getSubmissionDetails(
    @Req() req: any,
    @Param('id') id: string,
    @Param('submissionId') submissionId: string,
  ) {
    return this.quizzesService.getSubmissionDetails(
      this.getUserId(req),
      submissionId,
    );
  }
}
