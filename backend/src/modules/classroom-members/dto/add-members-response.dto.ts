import { Expose } from 'class-transformer';

export class AddMembersResponseDto {
  @Expose()
  added: number;

  @Expose()
  skipped: number;

  @Expose()
  total: number;
}
