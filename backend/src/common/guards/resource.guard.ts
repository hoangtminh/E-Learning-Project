import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Placeholder for resource/ownership checks (e.g. course.instructorId === user.sub).
 * Apply per-controller or use custom metadata + dedicated guards per resource.
 */
@Injectable()
export class ResourceGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
