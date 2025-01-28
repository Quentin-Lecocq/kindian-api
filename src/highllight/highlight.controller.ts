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
    console.log({ highlights });

    this.highlightService.saveHighlight(highlights);
    // highlights.forEach((highlight) => {
    //   const item = this.highlightService.saveHighlight(
    //     // highlight.content,
    //     // this.fromFileNameToTitle(highlight.filename),
    //   );
    //   console.log({
    //     filename: this.fromFileNameToTitle(highlight.filename),
    //     item,
    //   });
    // });
  }
}
