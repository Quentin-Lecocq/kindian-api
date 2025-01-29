import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Highlight } from '@prisma/client';
import { HighlightService } from './highlight.service';

@Controller('api/highlights')
export class HighlightController {
  constructor(private readonly highlightService: HighlightService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getHighlights(): Promise<{
    status: number;
    data: Highlight[];
    count: number;
  }> {
    try {
      const highlights = await this.highlightService.getHighlights({});

      return {
        status: HttpStatus.OK,
        data: highlights,
        count: highlights.length,
      };
    } catch (error) {
      console.error('Error getting highlights:', error);
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, data: [], count: 0 };
    }
  }

  @Post('save')
  @HttpCode(HttpStatus.OK)
  async saveHighlight(
    @Body()
    highlights: {
      content: string;
      filename: string;
    }[],
  ): Promise<{ status: number }> {
    try {
      await this.highlightService.saveHighlight(highlights);
      return { status: HttpStatus.OK };
    } catch (error: unknown) {
      console.error('Error saving highlights:', error);
      return { status: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
