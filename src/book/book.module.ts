import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SharedModule } from '../shared/shared.module';
import { BookController } from './book.controller';
import { BookService } from './book.service';

@Module({
  imports: [SharedModule],
  controllers: [BookController],
  providers: [BookService, PrismaService],
})
export class BookModule {}
