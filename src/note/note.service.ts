import { Injectable } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NoteService {
  constructor(private readonly prisma: PrismaService) {}

  async createNote(data: Prisma.NoteCreateInput): Promise<Note> {
    return this.prisma.note.create({
      data,
    });
  }
}
