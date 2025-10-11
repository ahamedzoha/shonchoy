import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { User } from '@workspace/shared-domain';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: Record<string, unknown>): User {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub as string,
      email: payload.email as string,
      firstName: (payload.firstName as string) || '',
      lastName: (payload.lastName as string) || '',
      isActive: (payload.isActive as boolean) ?? true,
      emailVerified: (payload.emailVerified as boolean) ?? false,
      createdAt: (payload.createdAt as string) || new Date().toISOString(),
      updatedAt: (payload.updatedAt as string) || new Date().toISOString(),
    };
  }
}
