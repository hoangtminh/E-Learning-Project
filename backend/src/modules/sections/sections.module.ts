import { Module } from '@nestjs/common';
import { SectionsController } from './sections.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SectionsService } from './sections.service';

@Module({
  imports: [PrismaModule],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
