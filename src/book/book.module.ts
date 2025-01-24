import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from '../prisma.service';
import { SharedModule } from '../shared/shared.module';
import { BookController } from './book.controller';
import { BookService } from './book.service';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [BookController],
  providers: [BookService, PrismaService],
})
export class BookModule {}
