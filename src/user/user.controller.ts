import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(
    @Body()
    userData: Prisma.UserCreateInput,
  ) {
    try {
      const existingUser = await this.userService.findBySupabaseId(
        userData.supabaseId,
      );

      if (existingUser) {
        return existingUser;
      }

      return await this.userService.createUser(userData);
    } catch (error) {
      console.error(error);
      throw new ConflictException(
        "Erreur lors de la création de l'utilisateur",
      );
    }
  }
}
