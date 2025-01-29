import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateNote(
    @Param('id') id: string,
    @Body() postData: { content: string },
  ): Promise<{ status: number }> {
    const { content } = postData;
    try {
      await this.noteService.updateNote(id, content);
      return { status: HttpStatus.OK };
    } catch (error: unknown) {
      console.error('Error update note', error);
      return { status: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNote(@Param('id') id: string): Promise<{ status: number }> {
    try {
      await this.noteService.deleteNote(id);
      return { status: HttpStatus.OK };
    } catch (error: unknown) {
      console.error('Error delete note', error);
      return { status: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
