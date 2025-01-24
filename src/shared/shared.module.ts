import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SharedValidatorService } from './shared-validator.service';

@Module({
  providers: [SharedValidatorService, PrismaService],
  exports: [SharedValidatorService],
})
export class SharedModule {}
