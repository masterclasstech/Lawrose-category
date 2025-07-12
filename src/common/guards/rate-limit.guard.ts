/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CacheService } from '../../modules/cache/cache.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const rateLimit = this.reflector.get<{ limit: number; windowMs: number }>('rateLimit', context.getHandler());
    
    if (!rateLimit) {
      return true;
    }

    const clientIp = request.ip || request.connection.remoteAddress;
    const key = `rate_limit:${clientIp}:${request.url}`;
    
    const current = await this.cacheService.get(key);
    const currentCount = current ? parseInt(current) : 0;
    
    if (currentCount >= rateLimit.limit) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    
    await this.cacheService.set(key, (currentCount + 1).toString(), rateLimit.windowMs / 1000);
    return true;
  }
}