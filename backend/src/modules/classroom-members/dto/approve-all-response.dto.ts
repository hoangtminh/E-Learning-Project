import { Expose } from 'class-transformer';

export class ApproveAllResponseDto {
  @Expose()
  approved: number;

  @Expose()
  message: string;
}
