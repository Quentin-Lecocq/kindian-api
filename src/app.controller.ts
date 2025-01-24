import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { BookService } from './book/book.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly bookService: BookService,
  ) {}
}
