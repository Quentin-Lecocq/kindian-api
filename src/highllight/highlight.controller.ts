import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { HighlightService } from './highlight.service';

@Controller('api/highlights')
export class HighlightController {
  constructor(private readonly highlightService: HighlightService) {}

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
