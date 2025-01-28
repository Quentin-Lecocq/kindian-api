import { Injectable } from '@nestjs/common';
import { Book, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

interface GoogleBookVolumeInfo {
  title: string;
  subtitle?: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  publisher?: string;
  language?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    thumbnail?: string;
  };
  previewLink?: string;
}

type MarkdownFile = {
  content: string;
  filename: string;
};

export interface Highlight {
  info: string;
  quote: string;
}

interface GoogleBookItem {
  id: string;
  selfLink: string;
  volumeInfo: GoogleBookVolumeInfo;
  searchInfo?: {
    textSnippet?: string;
  };
}

interface GoogleBookResponse {
  items?: GoogleBookItem[];
}

export interface KindleBook {
  title: string;
  author: string;
  highlights: unknown[];
}

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async book(
    bookWhereUniqueInput: Prisma.BookWhereUniqueInput,
  ): Promise<Book | null> {
    return this.prisma.book.findUnique({
      where: bookWhereUniqueInput,
    });
  }

  async books(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BookWhereUniqueInput;
    where?: Prisma.BookWhereInput;
    orderBy?: Prisma.BookOrderByWithRelationInput;
  }): Promise<Book[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.book.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createBook(data: Prisma.BookCreateInput): Promise<Book> {
    return this.prisma.book.create({
      data,
    });
  }

  async updateBook(params: {
    where: Prisma.BookWhereUniqueInput;
    data: Prisma.BookUpdateInput;
  }): Promise<Book> {
    const { where, data } = params;
    return this.prisma.book.update({
      where,
      data,
    });
  }

  async deleteBook(where: Prisma.BookWhereUniqueInput): Promise<Book> {
    return this.prisma.book.delete({
      where,
    });
  }

  async booksCount(where?: Prisma.BookWhereInput): Promise<number> {
    return this.prisma.book.count({
      where,
    });
  }

  async importKindleBooks(
    userId: string,
    rawBooks: KindleBook[],
  ): Promise<Book[]> {
    const enrichedBooks = await Promise.all(
      rawBooks.map(async (book) => {
        const bookInfo = await this.fetchGoogleBookInfo(
          book.title,
          book.author,
        );
        if (!bookInfo) return null;

        if (bookInfo.googleBooksId) {
          const existingBook = await this.prisma.book.findFirst({
            where: {
              googleBooksId: bookInfo.googleBooksId,
            },
          });

          if (existingBook) return null;
        }

        const newBook: Prisma.BookCreateManyInput = {
          title: book.title,
          author: book.author,
          highlightsCount: book.highlights.length,
          commentsCount: 0,
          bookmarksCount: 0,
          userId,
          googleBooksId: bookInfo.googleBooksId || null,
          isbn13: bookInfo.isbn13 || null,
          isbn10: bookInfo.isbn10 || null,
          imageUrl: bookInfo.imageUrl || null,
          subtitle: bookInfo.subtitle || null,
          publishedDate: bookInfo.publishedDate || null,
          pageCount: bookInfo.pageCount || null,
          description: bookInfo.description || null,
          categories: bookInfo.categories || [],
          googleBooksLink: bookInfo.googleBooksLink || null,
        };

        return newBook;
      }),
    );

    const validBooks = enrichedBooks.filter(
      (book): book is Prisma.BookCreateManyInput => book !== null,
    );

    if (validBooks.length === 0) {
      return [];
    }

    await this.prisma.book.createMany({
      data: validBooks,
    });

    return this.prisma.book.findMany({
      where: {
        userId,
        OR: validBooks.map(({ title, author, googleBooksId }) => ({
          AND: [
            { title },
            { author },
            { googleBooksId: googleBooksId || null },
          ],
        })),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async exportToMarkdown(kindleBooks: KindleBook[]): Promise<MarkdownFile[]> {
    const markdownFiles: MarkdownFile[] = await Promise.all(
      kindleBooks.map((book: KindleBook) => {
        const bookMd = `# ${book.title} - ${book.author}\n\n## Highlights\n\n`;
        const highlightsMd = book.highlights
          .map((h: Highlight) => `- ${h.quote}\n  ${h.info}`)
          .join('\n\n');

        return {
          content: bookMd + highlightsMd,
          filename: `${book.title.toLowerCase().replace(/\s+/g, '-')}.md`,
          // bookId: book.id,
        };
      }),
    );

    return markdownFiles;
  }

  private cleanKindleTitle(title: string): string {
    return title
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ûüù]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[']/g, '')
      .trim();
  }

  private async fetchGoogleBookInfo(
    title: string,
    author: string,
  ): Promise<Partial<Book> | null> {
    try {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      if (!apiKey) {
        console.error('Google Books API key is not configured');
        return null;
      }

      const cleanedTitle = this.cleanKindleTitle(title);
      let query = `intitle:"${cleanedTitle}"+inauthor:${author}`;
      let response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query,
        )}&key=${apiKey}`,
      );

      if (!response.ok) {
        console.error('Google Books API error:', response.statusText);
        return null;
      }

      let data = (await response.json()) as GoogleBookResponse;
      if (!data.items?.length) {
        const titleWords = cleanedTitle
          .split(' ')
          .filter((word) => word.length > 3);
        query = `${titleWords.join('+')}+inauthor:${author}`;
        response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query,
          )}&key=${apiKey}`,
        );

        if (!response.ok) return null;
        data = (await response.json()) as GoogleBookResponse;
      }

      if (!data.items?.length) return null;

      const officialBook = data.items.find((book) => {
        const info = book.volumeInfo;
        return (
          !info.title.toLowerCase().includes('tamil') &&
          !info.title.toLowerCase().includes('hindi') &&
          !info.subtitle?.toLowerCase().includes('summary') &&
          !info.description?.toLowerCase().includes('summary of') &&
          (info.pageCount || 0) > 100
        );
      });

      if (!officialBook) return null;

      const volumeInfo = officialBook.volumeInfo;

      return {
        googleBooksId: officialBook.id,
        isbn13:
          volumeInfo.industryIdentifiers?.find(({ type }) => type === 'ISBN_13')
            ?.identifier || null,
        isbn10:
          volumeInfo.industryIdentifiers?.find(({ type }) => type === 'ISBN_10')
            ?.identifier || null,
        imageUrl: volumeInfo.imageLinks?.thumbnail || null,
        subtitle: volumeInfo.subtitle || null,
        publishedDate: volumeInfo.publishedDate || null,
        pageCount: volumeInfo.pageCount || null,
        description: volumeInfo.description || null,
        categories: volumeInfo.categories || [],
        textSnippet: officialBook.searchInfo?.textSnippet || null,
        googleBooksLink: volumeInfo.previewLink || null,
      };
    } catch (error) {
      console.error('Error fetching Google Books info:', error);
      return null;
    }
  }
}
