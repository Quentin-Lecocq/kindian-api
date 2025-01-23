import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Book } from '@prisma/client';
import { AppService } from './app.service';
import { BookService } from './book.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly bookService: BookService,
  ) {}

  @Get('hello')
  getHello(): { message: string } {
    return { message: 'Hello World from NestJS!' };
  }

  @Get('books')
  getBooks(): Promise<Book[]> {
    return this.bookService.books({});
  }

  @Get('books/:id')
  async getBookById(@Param('id') id: string): Promise<Book | null> {
    return this.bookService.book({ id });
  }

  @Post('books')
  async createDraft(
    @Body()
    bookData: {
      title: string;
      author: string;
      isbn13: string;
      imageUrl: string;
      subtitle: string;
      description: string;
      userId: string;
    },
  ): Promise<Book> {
    const { title, author, isbn13, imageUrl, subtitle, description, userId } =
      bookData;
    return this.bookService.createBook({
      title,
      author,
      isbn13,
      imageUrl,
      subtitle,
      description,
      user: {
        connect: { id: userId },
      },
    });
  }
}
