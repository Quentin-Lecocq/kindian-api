import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Highlight, User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { HighlightService } from './highlight.service';

@Controller('api/highlights')
export class HighlightController {
  constructor(private readonly highlightService: HighlightService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getHighlights(
    @CurrentUser() user: User,
    @Query('orderBy') orderBy: 'addedAt' | 'isFavorite' = 'addedAt',
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ): Promise<{
    status: number;
    data: Highlight[];
    count: number;
  }> {
    try {
      const highlights = await this.highlightService.getHighlights({
        where: {
          userId: user.id,
        },
        orderBy: {
          [orderBy]: order,
        },
      });

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
  @UseGuards(AuthGuard)
  async saveHighlight(
    @Body()
    highlights: {
      content: string;
      filename: string;
    }[],
    @CurrentUser() user: User,
  ): Promise<{ status: number }> {
    try {
      await this.highlightService.saveHighlight(highlights, user.id);
      return { status: HttpStatus.OK };
    } catch (error: unknown) {
      console.error('Error saving highlights:', error);
      return { status: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }

  @Put(':id/favorite')
  @HttpCode(HttpStatus.OK)
  async favoriteHighlight(
    @Param('id') id: string,
    @Body() body: { value: boolean },
  ): Promise<{ status: number }> {
    const { value } = body;
    try {
      await this.highlightService.favoriteHighlight(id, value);
      return { status: HttpStatus.OK };
    } catch (error) {
      console.error('Error favoriting highlight:', error);
      return { status: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }
}
