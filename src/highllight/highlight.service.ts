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

  saveHighlight(content: string) {
    // Split by double newline to separate highlights
    const highlights = content.split('\n\n');

    // Get book title from first line
    const bookTitle = highlights[0].replace('# ', '');

    // Skip title and "## Highlights" lines
    const rawHighlights = highlights.slice(2);

    return rawHighlights.map((block) => {
      // Split highlight content from its metadata
      const [content, metadata] = block.split('\n  - ');

      // Parse metadata
      const pageMatch = metadata.match(/page (\d+)/);
      const locationMatch = metadata.match(/location (\d+-\d+)/);
      const dateMatch = metadata.match(/added on (.+)$/);

      return {
        content: content.replace('- ', '').trim(),
        page: pageMatch ? parseInt(pageMatch[1]) : null,
        location: locationMatch ? locationMatch[1] : null,
        addedAt: dateMatch ? dateMatch[1] : null,
      };
    });
  }
}
