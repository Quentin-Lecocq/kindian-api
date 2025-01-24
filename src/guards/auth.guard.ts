// src/guards/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { decode } from 'jsonwebtoken';
import { UserService } from '../user/user.service';

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token manquant');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token invalide');
    }

    const decoded = decode(token);
    if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
      throw new UnauthorizedException('Token invalide');
    }

    const user = await this.userService.findBySupabaseId(decoded.sub as string);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    request.user = user;
    return true;
  }
}
