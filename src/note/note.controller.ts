import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { NoteService } from './note.service';

@Controller('api/notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post('highlight/:id')
  @HttpCode(HttpStatus.CREATED)
  async createNote(
    @Param('id') id: string,
    @Body()
    postData: {
      content: string;
    },
  ): Promise<{ status: number }> {
    try {
      await this.noteService.createNote({
        content: postData.content,
        highlight: {
          connect: { id },
        },
      });

      return {
        status: HttpStatus.CREATED,
      };
    } catch (error: unknown) {
      console.error('Error create note', error);
      return { status: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
