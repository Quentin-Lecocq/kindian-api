import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Book, User } from '@prisma/client';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { SharedValidatorService } from '../shared/shared-validator.service';
import { BookService, KindleBook } from './book.service';

type MarkdownFile = {
  content: string;
  filename: string;
};

@Controller('api/books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly sharedValidator: SharedValidatorService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBooks(): Promise<{ status: number; data: Book[]; count: number }> {
    try {
      const books = await this.bookService.books({});

      return {
        status: HttpStatus.OK,
        data: books,
        // TODO: add real count when pagination is implemented
        // count: count,
        count: books.length,
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
              : 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-books')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserBooks(
    @CurrentUser() user: User,
  ): Promise<{ status: number; data: Book[]; count: number }> {
    try {
      const books = await this.bookService.books({
        where: {
          userId: user.id,
        },
      });

      return {
        status: HttpStatus.OK,
        data: books,
        count: books.length,
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
              : 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBookById(
    @Param('id') id: string,
  ): Promise<{ status: number; data: Book | null }> {
    try {
      this.sharedValidator.validateValidUUID(id);

      const book = await this.bookService.book({ id });

      if (!book) {
        return {
          status: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        status: HttpStatus.OK,
        data: book,
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
              : 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteBook(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<{ status: number }> {
    try {
      const book = await this.bookService.book({ id });
      if (!book) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Not Found',
            message: 'Book not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (book.userId !== user.id) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Forbidden',
            message: 'You can only delete your own books',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      await this.bookService.deleteBook({ id: book.id });

      return {
        status: HttpStatus.OK,
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
              : 'An unexpected error occurred while deleting book',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('import-kindle')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async importKindleBooks(
    @Body()
    rawBooks: Array<{ title: string; author: string; highlights: unknown[] }>,
    @CurrentUser() user: User,
  ): Promise<{
    status: number;
    data: Book[];
    count: number;
    error?: string | null;
  }> {
    try {
      if (!Array.isArray(rawBooks)) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            error: 'Validation Error',
            message: 'Payload must be an array of books',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const books = await this.bookService.importKindleBooks(user.id, rawBooks);

      return {
        status: HttpStatus.OK,
        data: books,
        count: books.length,
        error: null,
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
              : 'An unexpected error occurred while importing books',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('export-markdown')
  @HttpCode(HttpStatus.OK)
  async exportToMarkdown(
    @Body()
    body: {
      kindleBooks: KindleBook[];
    },
  ): Promise<{ status: number; data: MarkdownFile[] }> {
    const { kindleBooks } = body;
    try {
      if (!Array.isArray(kindleBooks)) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            error: 'Validation Error',
            message: 'Payload must be an array of books',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const markdownFiles =
        await this.bookService.exportToMarkdown(kindleBooks);

      return {
        status: HttpStatus.OK,
        data: markdownFiles,
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
              : 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
