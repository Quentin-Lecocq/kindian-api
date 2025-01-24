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
import { SharedValidatorService } from '../shared/shared-validator.service';
import { BookService } from './book.service';

@Controller('api/books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly sharedValidator: SharedValidatorService,
  ) {}

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
  @HttpCode(HttpStatus.OK)
  async getUserBooks(
    @Param('userId') userId: string,
  ): Promise<{ status: number; data: Book[]; count: number }> {
    try {
      // Validate UUID format
      this.sharedValidator.validateValidUUID(userId);

      // Validate user exists
      await this.sharedValidator.validateUserExists(userId);

      // Get user's books
      const books = await this.bookService.books({
        where: {
          userId: userId,
        },
      });

      return {
        status: HttpStatus.OK,
        data: books,
        count: books.length,
      };
    } catch (error: unknown) {
      // If it's already an HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise throw a generic server error
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Server Error',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
          error: 'Server Error',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred while creating books',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
