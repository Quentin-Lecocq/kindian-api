import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from '../prisma.service';
import { SharedModule } from '../shared/shared.module';
import { HighlightController } from './highlight.controller';
import { HighlightService } from './highlight.service';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [HighlightController],
  providers: [HighlightService, PrismaService],
})
export class HighlightModule {}
