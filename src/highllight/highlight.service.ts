import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

export interface HighlightToDb {
  id: string;
  bookId: string;
  content: string;
  location: string;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

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

  async getBookIdByTitle(title: string): Promise<string | null> {
    const book = await this.prisma.book.findFirst({
      where: {
        title: {
          equals: title,
          mode: 'insensitive',
        },
      },
    });
    return book?.id || null;
  }

  async saveHighlight(
    highlights: {
      content: string;
      filename: string;
    }[],
  ) {
    const dataToSave: any[] = [];

    for (const highlight of highlights) {
      const bookId = await this.getBookIdByTitle(
        this.fromFileNameToTitle(highlight.filename),
      );

      const highlightsArray = highlight.content.split('\n\n');
      const rawHighlights = highlightsArray.slice(2);

      rawHighlights.forEach((rawHighlight) => {
        const [content, metadata] = rawHighlight.split('\n  - ');
        const pageMatch = metadata.match(/page (\d+)/);
        const locationMatch = metadata.match(/location (\d+-\d+)/);
        const dateMatch = metadata.match(/added on (.+)$/);

        dataToSave.push({
          content: content.replace('- ', '').trim(),
          page: pageMatch ? parseInt(pageMatch[1]) : null,
          location: locationMatch ? locationMatch[1] : null,
          addedAt: dateMatch ? dateMatch[1] : null,
          bookTitle: this.fromFileNameToTitle(highlight.filename),
          bookId,
        });
      });

      console.log(dataToSave);
    }
  }
}
