import { Expose, Type } from 'class-transformer';

export class PendingMemberUserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string | null;

  @Expose()
  avatarUrl: string | null;
}

export class PendingMemberDto {
  @Expose()
  id: string;

  @Expose()
  classroomId: string;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => PendingMemberUserDto)
  user: PendingMemberUserDto;
}
