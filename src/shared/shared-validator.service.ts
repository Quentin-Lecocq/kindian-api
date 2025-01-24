import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SharedValidatorService {
  constructor(private prisma: PrismaService) {}

  async validateUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException("The user doesn't exist");
    }
  }

  validateValidUUID(id: string): void {
    if (
      !id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid format',
          message: 'The provided id is not a valid UUID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
