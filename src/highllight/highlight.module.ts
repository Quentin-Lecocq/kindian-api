import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SharedModule } from 'src/shared/shared.module';
import { HighlightController } from './highlight.controller';
import { HighlightService } from './highlight.service';

@Module({
  imports: [SharedModule],
  controllers: [HighlightController],
  providers: [HighlightService, PrismaService],
})
export class HighlightModule {}
