/* eslint-disable prettier/prettier */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../../modules/cache/cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>('cacheKey', context.getHandler());
    const cacheTtl = this.reflector.get<number>('cacheTtl', context.getHandler()) || 300;
    
    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const fullCacheKey = `${cacheKey}:${JSON.stringify(request.query)}`;
    
    const cached = await this.cacheService.get(fullCacheKey);
    if (cached) {
      return of(JSON.parse(cached));
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(fullCacheKey, JSON.stringify(data), cacheTtl);
      }),
    );
  }
}