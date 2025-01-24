import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './book/book.module';
import { PrismaService } from './prisma.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [ConfigModule.forRoot(), BookModule, SharedModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
