import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Book } from '@prisma/client';
import { BookService } from './book.service';

@Controller('api/books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getBooks(): Promise<{ data: Book[]; count: number }> {
    // const [books, count] = await Promise.all([
    //   this.bookService.books({}),
    //   this.bookService.booksCount(),
    // ]);
    const books = await this.bookService.books({});

    return {
      data: books,
      // TODO: add real count when pagination is implemented
      // count: count,
      count: books.length,
    };
  }

  @Get('user/:userId')
  getUserBooks(@Param('userId') userId: string) {
    return this.bookService.books({
      where: {
        userId: userId,
      },
    });
  }

  @Get(':id')
  getBookById(@Param('id') id: string): Promise<Book | null> {
    return this.bookService.book({ id });
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createDraft(
    @Body()
    booksData: {
      title: string;
      author: string;
      isbn13: string;
      imageUrl: string;
      subtitle: string;
      description: string;
      userId: string;
    }[],
  ): Promise<{ status: number; data: Book[] }> {
    try {
      const booksArray = Array.isArray(booksData) ? booksData : [booksData];

      const createdBooks = await Promise.all(
        booksArray.map((bookData) => {
          const {
            title,
            author,
            isbn13,
            imageUrl,
            subtitle,
            description,
            userId,
          } = bookData;
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
        }),
      );

      return {
        status: HttpStatus.CREATED,
        data: createdBooks,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Erreur lors de la création des livres',
          message: error instanceof Error ? error.message : 'Erreur inconnue',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
