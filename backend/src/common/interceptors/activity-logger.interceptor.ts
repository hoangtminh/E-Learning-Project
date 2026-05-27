import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { GlobalRole } from '@prisma/client';

type AuthUser = {
  userId: string;
  email: string;
  fullName: string | null;
  role: GlobalRole;
};

// Map HTTP method + route pattern → human-readable action
function resolveAction(method: string, path: string): string | null {
  const m = method.toUpperCase();

  // Auth
  if (m === 'POST' && path.includes('/auth/register')) return 'USER_REGISTER';
  if (m === 'POST' && path.includes('/auth/login')) return 'USER_LOGIN';

  // Admin user management
  if (m === 'POST' && path.match(/\/admin\/users$/)) return 'ADMIN_CREATE_USER';
  if (m === 'PATCH' && path.match(/\/admin\/users\/[^/]+\/role$/)) return 'ADMIN_UPDATE_ROLE';
  if (m === 'PATCH' && path.match(/\/admin\/users\/[^/]+\/suspend$/)) return 'ADMIN_SUSPEND_USER';
  if (m === 'PATCH' && path.match(/\/admin\/users\/[^/]+\/reset-password$/)) return 'ADMIN_RESET_PASSWORD';
  if (m === 'DELETE' && path.match(/\/admin\/users\/[^/]+$/)) return 'ADMIN_DELETE_USER';
  if (m === 'DELETE' && path.match(/\/admin\/logs\/bulk/)) return 'ADMIN_BULK_DELETE_LOGS';

  // Classrooms
  if (m === 'POST' && path.match(/\/classrooms$/)) return 'CLASSROOM_CREATE';
  if (m === 'PATCH' && path.match(/\/classrooms\/[^/]+$/)) return 'CLASSROOM_UPDATE';
  if (m === 'DELETE' && path.match(/\/classrooms\/[^/]+$/)) return 'CLASSROOM_DELETE';

  // Classroom members
  if (m === 'POST' && path.match(/\/classrooms\/[^/]+\/members/)) return 'CLASSROOM_JOIN';
  if (m === 'DELETE' && path.match(/\/classrooms\/[^/]+\/members/)) return 'CLASSROOM_LEAVE';
  if (m === 'POST' && path.match(/\/members\/[^/]+\/approve/)) return 'CLASSROOM_APPROVE_MEMBER';
  if (m === 'POST' && path.match(/\/members\/[^/]+\/reject/)) return 'CLASSROOM_REJECT_MEMBER';

  // Courses
  if (m === 'POST' && path.match(/\/courses$/)) return 'COURSE_CREATE';
  if (m === 'PATCH' && path.match(/\/courses\/[^/]+$/)) return 'COURSE_UPDATE';
  if (m === 'DELETE' && path.match(/\/courses\/[^/]+$/)) return 'COURSE_DELETE';
  if (m === 'POST' && path.match(/\/courses\/[^/]+\/enroll/)) return 'COURSE_ENROLL';

  // Tasks
  if (m === 'POST' && path.match(/\/tasks$/)) return 'TASK_CREATE';
  if (m === 'PATCH' && path.match(/\/tasks\/[^/]+$/)) return 'TASK_UPDATE';
  if (m === 'DELETE' && path.match(/\/tasks\/[^/]+$/)) return 'TASK_DELETE';
  if (m === 'POST' && path.match(/\/tasks\/[^/]+\/submit/)) return 'TASK_SUBMIT';
  if (m === 'PATCH' && path.match(/\/tasks\/submissions\/[^/]+\/grade/)) return 'TASK_GRADE';

  // Quizzes
  if (m === 'POST' && path.match(/\/quizzes$/)) return 'QUIZ_CREATE';
  if (m === 'DELETE' && path.match(/\/quizzes\/[^/]+$/)) return 'QUIZ_DELETE';
  if (m === 'POST' && path.match(/\/quizzes\/[^/]+\/submit/)) return 'QUIZ_SUBMIT';

  // Payment
  if (m === 'POST' && path.match(/\/payment\/create/)) return 'PAYMENT_INITIATE';

  // Files
  if (m === 'DELETE' && path.match(/\/files\/[^/]+$/)) return 'FILE_DELETE';

  // Chat
  if (m === 'POST' && path.match(/\/chat\/messages/)) return null; // Too frequent, skip

  // Generic fallback for other mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(m)) {
    return `${m}_${path.split('/').filter(Boolean).slice(0, 2).join('_').toUpperCase()}`;
  }

  return null;
}

function getClientIp(req: Request): string {
  // 1. Cloudflare Tunnel sets this header with the real visitor IP.
  //    It cannot be spoofed by the client — Cloudflare controls it.
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp) return cfIp.trim();

  // 2. Traefik / generic reverse proxy: take the first (leftmost) IP in the chain.
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded)
    return forwarded.split(',')[0].trim();

  // 3. Nginx-style single-IP header.
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp) return realIp.trim();

  // 4. Direct connection fallback (local dev / no proxy).
  return req.socket?.remoteAddress || 'unknown';
}

@Injectable()
export class ActivityLoggerInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request & { user?: AuthUser }>();
    const { method, path, url } = req;

    const action = resolveAction(method, url || path);

    // Skip GET requests and paths with no action resolved (e.g., chat messages)
    if (!action) return next.handle();

    const userId = req.user?.userId ?? null;
    const ipAddress = getClientIp(req);
    const userAgent = (req.headers['user-agent'] || '').slice(0, 500);

    return next.handle().pipe(
      tap(async (data: any) => {
        // Log successful mutation
        try {
          let resolvedUserId = userId;
          if (!resolvedUserId && data?.user?.id) {
            resolvedUserId = data.user.id;
          }
          await this.prisma.systemLog.create({
            data: {
              userId: resolvedUserId,
              action,
              details: `${method} ${url}`,
              level: 'info',
              ipAddress,
              userAgent,
            },
          });
        } catch {
          // Never break the request due to logging failure
        }
      }),
      catchError((err) => {
        // Log failed mutations (4xx/5xx)
        const isClientError = err?.status >= 400 && err?.status < 500;
        if (!isClientError) {
          this.prisma.systemLog
            .create({
              data: {
                userId,
                action: `${action}_FAILED`,
                details: err?.message || `${method} ${url} failed`,
                level: 'error',
                ipAddress,
                userAgent,
              },
            })
            .catch(() => {});
        }
        return throwError(() => err);
      }),
    );
  }
}
