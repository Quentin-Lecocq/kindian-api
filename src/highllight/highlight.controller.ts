import { Body, Controller, Post } from '@nestjs/common';
import { HighlightService } from './highlight.service';

@Controller('api/highlights')
export class HighlightController {
  constructor(private readonly highlightService: HighlightService) {}

  @Post('save')
  async saveHighlight(
    @Body()
    highlights: {
      content: string;
      filename: string;
    }[],
  ) {
    highlights.forEach((highlight) => {
      const item = this.highlightService.saveHighlight(highlight.content);
      console.log({
        filename: highlight.filename,
        item,
      });
    });
  }
}
