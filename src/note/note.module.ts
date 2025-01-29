import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SharedModule } from 'src/shared/shared.module';
import { UserModule } from 'src/user/user.module';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [NoteController],
  providers: [NoteService, PrismaService],
})
export class NoteModule {}
