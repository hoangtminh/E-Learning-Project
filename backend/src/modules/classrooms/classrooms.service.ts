import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { ClassroomRole, GlobalRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

@Injectable()
export class ClassroomsService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async create(userId: string, dto: CreateClassroomDto) {
    // Auto-generate a unique 6-char invite code
    let inviteCode: string;
    let tries = 0;
    do {
      inviteCode = generateInviteCode();
      const existing = await this.prisma.classroom.findUnique({
        where: { inviteCode },
      });
      if (!existing) break;
      tries++;
    } while (tries < 100);

    const classroom = await this.prisma.classroom.create({
      data: {
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
        inviteCode,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: ClassroomRole.owner,
          },
        },
      },
    });

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `classrooms/${classroom.id}/`,
        }),
      );
    } catch (err) {
      console.error('Failed to create S3 folder for classroom', err);
    }

    return classroom;
  }

  async findAll(userId: string) {
    return this.prisma.classroom.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        owner: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },

      },
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom not found`);
    }

    const userMember = classroom.members.find((m) => m.userId === userId);
    if (!userMember) {
      throw new ForbiddenException(`You are not a member of this classroom`);
    }

    return {
      ...classroom,
      role: userMember.role,
    };
  }

  async update(id: string, userId: string, dto: UpdateClassroomDto) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId: id, userId } },
    });

    if (!member) {
      throw new NotFoundException(
        `Classroom not found or you are not a member`,
      );
    }

    if (
      member.role !== ClassroomRole.owner &&
      member.role !== ClassroomRole.admin
    ) {
      throw new ForbiddenException(
        `You do not have permission to update this classroom`,
      );
    }

    return this.prisma.classroom.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId: id, userId } },
    });

    if (!member) {
      throw new NotFoundException(
        `Classroom not found or you are not a member`,
      );
    }

    if (member.role !== ClassroomRole.owner) {
      throw new ForbiddenException(`Only the owner can delete this classroom`);
    }



    const classroomToDelete = await this.prisma.classroom.findUnique({
      where: { id },
    });

    // Delete all objects in S3 folder
    try {
      const prefix = `classrooms/${id}/`;
      const listedObjects = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: prefix,
        }),
      );

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        const deleteParams = {
          Bucket: this.bucketName,
          Delete: {
            Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
          },
        };
        await this.s3Client.send(new DeleteObjectsCommand(deleteParams));
      }
    } catch (err) {
      console.error('Failed to delete S3 folder for classroom', err);
    }

    // 3. Delete DB records in exact dependency-respecting order inside a transaction
    await this.prisma.$transaction(async (tx) => {

      // B. Delete Post Comments
      await tx.classroomPostComment.deleteMany({
        where: { post: { classroomId: id } },
      });

      // C. Delete Posts
      await tx.classroomPost.deleteMany({
        where: { classroomId: id },
      });

      // D. Delete Task Submissions
      await tx.taskSubmission.deleteMany({
        where: { task: { classroomId: id } },
      });

      // E. Delete Classroom Tasks
      await tx.classroomTask.deleteMany({
        where: { classroomId: id },
      });

      // F. Delete Classroom Files
      await tx.classroomFile.deleteMany({
        where: { classroomId: id },
      });



      // I. Delete Notes
      await tx.note.deleteMany({
        where: { classroomId: id },
      });

      // J. Delete Calls
      await tx.call.deleteMany({
        where: { classroomId: id },
      });

      // K. Delete Messages
      await tx.message.deleteMany({
        where: { conversation: { classroomId: id } },
      });

      // L. Delete Conversation Members
      await tx.conversationMember.deleteMany({
        where: { conversation: { classroomId: id } },
      });

      // M. Delete Conversations
      await tx.conversation.deleteMany({
        where: { classroomId: id },
      });

      // N. Delete Join Requests
      await tx.classroomJoinRequest.deleteMany({
        where: { classroomId: id },
      });

      // O. Delete Classroom Members
      await tx.classroomMember.deleteMany({
        where: { classroomId: id },
      });

      // P. Delete the Classroom itself
      await tx.classroom.delete({
        where: { id },
      });
    });

    return classroomToDelete;
  }

  async joinByCode(userId: string, code: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { inviteCode: code.toUpperCase() },
    });

    if (!classroom) {
      throw new NotFoundException(`Invite code not found`);
    }

    // Already a member?
    const existingMember = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId: classroom.id, userId } },
    });
    if (existingMember) {
      throw new ConflictException(`You are already a member of this classroom`);
    }

    // Already has a pending request?
    const existingRequest = await this.prisma.classroomJoinRequest.findUnique({
      where: { classroomId_userId: { classroomId: classroom.id, userId } },
    });
    if (existingRequest) {
      throw new ConflictException(
        `You already have a pending join request for this classroom`,
      );
    }

    if (classroom.isPublic) {
      await this.prisma.classroomMember.create({
        data: {
          classroomId: classroom.id,
          userId,
          role: ClassroomRole.member,
        },
      });
      return { classroomId: classroom.id, status: 'joined' };
    } else {
      // Always create a join request — owner approves it
      await this.prisma.classroomJoinRequest.create({
        data: { classroomId: classroom.id, userId },
      });
      return { classroomId: classroom.id, status: 'pending' };
    }
  }

  async getMyPendingClassrooms(userId: string) {
    const requests = await this.prisma.classroomJoinRequest.findMany({
      where: { userId },
      include: {
        classroom: {
          include: {
            _count: { select: { members: true } },
            owner: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      requestId: r.id,
      createdAt: r.createdAt,
      classroom: r.classroom,
    }));
  }



  // --- POSTS ---
  async getPosts(classroomId: string, userId: string) {
    // Check membership
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this classroom');

    return this.prisma.classroomPost.findMany({
      where: { classroomId },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPost(classroomId: string, userId: string, content: string) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this classroom');

    const post = await this.prisma.classroomPost.create({
      data: {
        classroomId,
        authorId: userId,
        content,
      },
      include: {
        author: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
    });

    // Asynchronously create notifications for other members
    (async () => {
      try {
        const classroom = await this.prisma.classroom.findUnique({
          where: { id: classroomId },
          select: { title: true },
        });

        const allMembers = await this.prisma.classroomMember.findMany({
          where: { classroomId },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });

        let notificationType = 'post';
        let typeLabel = 'thông báo';
        if (content.startsWith('[SYSTEM_CALL]')) {
          notificationType = 'call';
          typeLabel = 'cuộc gọi';
        } else if (content.startsWith('[SYSTEM_TASK]')) {
          notificationType = 'task';
          typeLabel = 'task';
        } else if (content.startsWith('[SYSTEM_FILE]')) {
          notificationType = 'file';
          typeLabel = 'file';
        }

        const authorName = post.author.fullName || post.author.email || 'Thành viên';
        const classroomName = classroom?.title || 'Lớp học';
        const link = `/classrooms/${classroomId}`;

        const contentLower = content.toLowerCase();
        const isPingAll = contentLower.includes('@all');

        const isPinged = (m: typeof allMembers[0]) => {
          if (isPingAll) return true;
          const email = m.user.email.toLowerCase();
          const fullName = m.user.fullName?.toLowerCase();
          const mId = m.user.id;
          if (contentLower.includes('@' + email)) return true;
          if (fullName && contentLower.includes('@' + fullName)) return true;
          if (fullName && contentLower.includes(`@[${fullName}](${mId})`)) return true;
          if (contentLower.includes('@' + mId)) return true;
          return false;
        };

        // Always emit classroom:refresh-posts event to all other classroom members so their UI updates immediately
        allMembers
          .filter((m) => m.userId !== userId)
          .forEach((m) => {
            this.notificationsService.sendEventToUser(m.userId, 'classroom:refresh-posts', { classroomId });
          });

        const promises = allMembers
          .filter((m) => m.userId !== userId)
          .filter((m) => m.notificationsEnabled || isPinged(m))
          .map((m) => {
            const pinged = isPinged(m);
            let notifyContent = '';
            if (pinged) {
              if (isPingAll) {
                notifyContent = `${authorName} đã nhắc đến mọi người trong classroom ${classroomName}`;
              } else {
                notifyContent = `${authorName} đã nhắc đến bạn trong classroom ${classroomName}`;
              }
            } else {
              notifyContent = `${authorName} đã tạo trong classroom ${classroomName} có 1 thông báo`;
              if (notificationType !== 'post') {
                notifyContent += ` ${typeLabel}`;
              }
            }

            return this.notificationsService.createNotification(
              m.userId,
              userId,
              notificationType,
              notifyContent,
              link,
            );
          });
        await Promise.all(promises);
      } catch (err) {
        console.error('Failed to create classroom post notifications:', err);
      }
    })();

    return post;
  }

  async updatePost(
    classroomId: string,
    postId: string,
    userId: string,
    content: string,
  ) {
    const post = await this.prisma.classroomPost.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.classroomId !== classroomId)
      throw new BadRequestException('Post does not belong to this classroom');
    if (post.authorId !== userId)
      throw new ForbiddenException('Only the author can edit this post');

    // Update current post directly
    const updatedPost = await this.prisma.classroomPost.update({
      where: { id: postId },
      data: { content },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    // Notify other classroom members to refresh their posts in real-time
    try {
      const allMembers = await this.prisma.classroomMember.findMany({
        where: { classroomId },
      });
      allMembers
        .filter((m) => m.userId !== userId)
        .forEach((m) => {
          this.notificationsService.sendEventToUser(m.userId, 'classroom:refresh-posts', { classroomId });
        });
    } catch (err) {
      console.error('Failed to broadcast post update event:', err);
    }

    return updatedPost;
  }

  async deletePost(classroomId: string, postId: string, userId: string) {
    const post = await this.prisma.classroomPost.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.classroomId !== classroomId)
      throw new BadRequestException('Post does not belong to this classroom');

    // Check if user is author OR owner/admin of the classroom
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    const isOwnerOrAdmin = member && (member.role === ClassroomRole.owner || member.role === ClassroomRole.admin);

    if (post.authorId !== userId && !isOwnerOrAdmin) {
      throw new ForbiddenException('Only the author or classroom admins can delete this post');
    }

    const deletedPost = await this.prisma.classroomPost.delete({
      where: { id: postId },
    });

    // Notify other classroom members to refresh their posts in real-time
    try {
      const allMembers = await this.prisma.classroomMember.findMany({
        where: { classroomId },
      });
      allMembers
        .filter((m) => m.userId !== userId)
        .forEach((m) => {
          this.notificationsService.sendEventToUser(m.userId, 'classroom:refresh-posts', { classroomId });
        });
    } catch (err) {
      console.error('Failed to broadcast post delete event:', err);
    }

    return deletedPost;
  }

  // --- COMMENTS ---
  async getComments(classroomId: string, postId: string, userId: string) {
    // Check membership
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this classroom');

    return this.prisma.classroomPostComment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createComment(
    classroomId: string,
    postId: string,
    userId: string,
    content: string,
  ) {
    const member = await this.prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this classroom');

    return this.prisma.classroomPostComment.create({
      data: {
        postId,
        authorId: userId,
        content,
      },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });
  }

  async updateComment(
    classroomId: string,
    commentId: string,
    userId: string,
    content: string,
  ) {
    const comment = await this.prisma.classroomPostComment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.post.classroomId !== classroomId)
      throw new BadRequestException(
        'Comment does not belong to this classroom',
      );
    if (comment.authorId !== userId)
      throw new ForbiddenException('Only the author can edit this comment');

    return this.prisma.classroomPostComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });
  }

  async deleteComment(classroomId: string, commentId: string, userId: string) {
    const comment = await this.prisma.classroomPostComment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.post.classroomId !== classroomId)
      throw new BadRequestException(
        'Comment does not belong to this classroom',
      );

    // Author of comment OR Author of post can delete
    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    return this.prisma.classroomPostComment.delete({
      where: { id: commentId },
    });
  }
}
