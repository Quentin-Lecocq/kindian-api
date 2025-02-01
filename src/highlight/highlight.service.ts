import { Injectable } from '@nestjs/common';
import { Highlight, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HighlightService {
  constructor(private readonly prisma: PrismaService) {}

  private fromFileNameToTitle(filename: string): string {
    return filename
      .replace(/\.md$/, '') // Remove the .md extension
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
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

  async getBookIdAndAuthorByTitle(title: string): Promise<{
    id: string;
    author: string;
    title: string;
  } | null> {
    const book = await this.prisma.book.findFirst({
      where: {
        title: {
          equals: title,
          mode: 'insensitive',
        },
      },
    });

    return book
      ? { id: book.id, author: book.author, title: book.title }
      : null;
  }

  async getHighlights(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.HighlightWhereUniqueInput;
    where?: Prisma.HighlightWhereInput;
    orderBy?: Prisma.HighlightOrderByWithRelationInput;
  }): Promise<Highlight[]> {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prisma.highlight.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        notes: true,
        subHighlights: true,
      },
    });
  }

  async saveHighlight(
    highlights: {
      content: string;
      filename: string;
    }[],
    userId: string,
  ) {
    const dataToSave: Prisma.HighlightCreateManyInput[] = [];

    for (const highlight of highlights) {
      const book = await this.getBookIdAndAuthorByTitle(
        this.fromFileNameToTitle(highlight.filename),
      );

      if (!book?.id) {
        console.log('Book not found for', highlight.filename);
        continue;
      }

      const highlightsArray = highlight.content.split('\n\n');
      const rawHighlights = highlightsArray.slice(2);

      rawHighlights.forEach((rawHighlight) => {
        const [content, metadata] = rawHighlight.split('\n  - ');
        const pageMatch = metadata.match(/page (\d+)/);
        const locationMatch = metadata.match(/location (\d+-\d+)/);
        const dateMatch = metadata.match(/added on (.+)$/);

        dataToSave.push({
          content: content.replace('- ', '').trim(),
          page: pageMatch ? parseInt(pageMatch[1]) : 0,
          location: locationMatch ? locationMatch[1] : '',
          addedAt: new Date(dateMatch ? dateMatch[1] : new Date()),
          bookTitle: book.title,
          bookId: book.id,
          bookAuthor: book.author,
          userId,
        });
      });
    }

    try {
      await this.prisma.highlight.createMany({
        data: dataToSave,
      });
    } catch (error) {
      console.error('Error saving highlights:', error);
    }
  }

  async favoriteHighlight(highlightId: string, value: boolean) {
    await this.prisma.highlight.update({
      where: { id: highlightId },
      data: { isFavorite: value },
    });
  }

  async deleteHighlight(highlightId: string) {
    await this.prisma.highlight.delete({
      where: { id: highlightId },
    });
  }

  async updateHighlight(highlightId: string, content: string) {
    await this.prisma.highlight.update({
      where: { id: highlightId },
      data: { content },
    });
  }

  async createSubhighlight(
    highlightId: string,
    startIndex: number,
    endIndex: number,
  ) {
    await this.prisma.subHighlight.create({
      data: {
        highlightId,
        startIndex,
        endIndex,
      },
    });
  }

  async deleteSubhighlight(subHighlightId: string) {
    await this.prisma.subHighlight.delete({
      where: {
        id: subHighlightId,
      },
    });
  }
}
