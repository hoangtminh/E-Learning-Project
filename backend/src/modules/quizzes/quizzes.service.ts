import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto, ShareQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async createQuiz(userId: string, data: CreateQuizDto) {
    console.log(data);
    return this.prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic ?? false,
        duration: data.duration && data.duration > 0 ? data.duration : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        creatorId: userId,
        questions: {
          create: data.questions?.map(q => {
            const options = q.type === 'text' && q.correctText 
              ? [{ content: q.correctText, isCorrect: true, orderIndex: 0 }]
              : q.options || [];
            
            return {
              type: q.type,
              content: q.content,
              orderIndex: q.orderIndex ?? 0,
              points: q.points ?? 1,
              options: {
                create: options.map(o => ({
                  content: o.content,
                  isCorrect: o.isCorrect ?? false,
                  orderIndex: o.orderIndex ?? 0,
                }))
              }
            };
          }) || []
        }
      },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        questions: {
          include: { options: true }
        },
        _count: { select: { questions: true, memberships: true } }
      }
    });
  }

  async updateQuiz(userId: string, quizId: string, data: UpdateQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({ 
      where: { id: quizId },
      include: { questions: true }
    });
    
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.creatorId !== userId) throw new ForbiddenException('Not authorized');

    return this.prisma.$transaction(async (tx) => {
      if (data.questions) {
        await tx.question.deleteMany({ where: { quizId } });
      }

      return tx.quiz.update({
        where: { id: quizId },
        data: {
          title: data.title,
          description: data.description,
          isPublic: data.isPublic,
          duration: data.duration && data.duration > 0 ? data.duration : null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          questions: data.questions ? {
            create: data.questions.map(q => {
              const options = q.type === 'text' && q.correctText 
                ? [{ content: q.correctText, isCorrect: true, orderIndex: 0 }]
                : q.options || [];

              return {
                type: q.type,
                content: q.content,
                orderIndex: q.orderIndex ?? 0,
                points: q.points ?? 1,
                options: {
                  create: options.map(o => ({
                    content: o.content,
                    isCorrect: o.isCorrect ?? false,
                    orderIndex: o.orderIndex ?? 0,
                  }))
                }
              };
            })
          } : undefined
        },
        include: {
          creator: { select: { id: true, fullName: true, avatarUrl: true } },
          questions: {
            include: { options: true }
          },
          _count: { select: { questions: true, memberships: true } }
        }
      });
    });
  }

  async deleteQuiz(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.creatorId !== userId)
      throw new ForbiddenException('Not authorized');

    await this.prisma.quiz.delete({ where: { id: quizId } });
    return { success: true };
  }

  async shareQuiz(userId: string, quizId: string, data: ShareQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.creatorId !== userId)
      throw new ForbiddenException('Not authorized');

    if (data.userIds && data.userIds.length > 0) {
      await this.prisma.quizMembership.createMany({
        data: data.userIds.map((uid) => ({ quizId, userId: uid })),
        skipDuplicates: true,
      });
    }
    return { success: true };
  }

  async getQuiz(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        questions: {
          include: {
            options: { select: { id: true, content: true, orderIndex: true } },
          },
        },
        memberships: { where: { userId } },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');

    // Check access
    if (
      !quiz.isPublic &&
      quiz.creatorId !== userId &&
      quiz.memberships.length === 0
    ) {
      throw new ForbiddenException('Not authorized to view this quiz');
    }

    return quiz;
  }

  async getCreatedQuizzes(userId: string) {
    return this.prisma.quiz.findMany({
      where: { creatorId: userId },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { questions: true, memberships: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJoinedQuizzes(userId: string) {
    return this.prisma.quiz.findMany({
      where: {
        memberships: { some: { userId } },
        creatorId: { not: userId },
      },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { questions: true, memberships: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicQuizzes(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.quiz.findMany({
      where: { isPublic: true },
      include: {
        creator: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { questions: true, memberships: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async submitQuiz(userId: string, quizId: string, data: SubmitQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { include: { options: true } },
        memberships: { where: { userId } },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    if (
      !quiz.isPublic &&
      quiz.creatorId !== userId &&
      quiz.memberships.length === 0
    ) {
      throw new ForbiddenException('Not authorized to submit this quiz');
    }

    // Calculate score
    let totalScore = 0;
    let correctCount = 0;

    const results = quiz.questions.map((question) => {
      const userAnswer = data.answers.find((a) => a.questionId === question.id);
      let isCorrect = false;

      if (userAnswer) {
        if (question.type === 'text') {
          const correctOption = question.options.find((o) => o.isCorrect);
          if (
            correctOption &&
            userAnswer.textAnswer?.trim().toLowerCase() ===
              correctOption.content.trim().toLowerCase()
          ) {
            isCorrect = true;
          }
        } else if (question.type === 'single_choice') {
          const selectedOptionId = userAnswer.selectedOptionIds?.[0];
          const selectedOption = question.options.find(
            (o) => o.id === selectedOptionId,
          );
          if (selectedOption?.isCorrect) {
            isCorrect = true;
          }
        } else if (question.type === 'multiple_choice') {
          const correctOptionIds = question.options
            .filter((o) => o.isCorrect)
            .map((o) => o.id);
          const selectedIds = userAnswer.selectedOptionIds || [];

          const isAllCorrectSelected =
            correctOptionIds.length === selectedIds.length &&
            correctOptionIds.every((id) => selectedIds.includes(id));

          if (isAllCorrectSelected) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect) {
        totalScore += question.points;
        correctCount++;
      }

      return {
        questionId: question.id,
        isCorrect,
        points: isCorrect ? question.points : 0,
        maxPoints: question.points,
      };
    });

    // Save submission
    const submission = await this.prisma.quizSubmission.create({
      data: {
        quizId,
        userId,
        score: totalScore,
        timeSpent: data.timeSpent,
        answers: {
          create: data.answers.map((ans) => {
            const result = results.find((r) => r.questionId === ans.questionId);
            return {
              questionId: ans.questionId,
              textAnswer: ans.textAnswer,
              isCorrect: result?.isCorrect || false,
              selectedOptions: ans.selectedOptionIds
                ? {
                    create: ans.selectedOptionIds.map((optId) => ({
                      optionId: optId,
                    })),
                  }
                : undefined,
            };
          }),
        },
      },
    });

    return this.getSubmissionDetails(userId, submission.id);
  }

  async getQuizSubmissions(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    // allow quiz creator to see all submissions, users can only see theirs
    const whereClause: any = { quizId };
    if (quiz.creatorId !== userId) {
      whereClause.userId = userId;
    }

    return this.prisma.quizSubmission.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getSubmissionDetails(userId: string, submissionId: string) {
    const submission = await this.prisma.quizSubmission.findUnique({
      where: { id: submissionId },
      include: {
        quiz: true,
        answers: {
          include: {
            selectedOptions: true,
            question: { include: { options: true } },
          },
        },
      },
    });

    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.userId !== userId && submission.quiz.creatorId !== userId) {
      throw new ForbiddenException('Not authorized to view this submission');
    }

    return {
      ...submission,
      answers: submission.answers.map((ans) => ({
        ...ans,
        points: ans.isCorrect ? ans.question.points : 0,
        maxPoints: ans.question.points,
      })),
    };
  }
}
