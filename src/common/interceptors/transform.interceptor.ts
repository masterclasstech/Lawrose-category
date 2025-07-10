/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
    path: string;
    method: string;
    totalCount?: number;
    pageCount?: number;
    currentPage?: number;
    perPage?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    responseTime?: string;
  };
  errors?: any[];
}

export interface PaginationMeta {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    // Generate unique request ID if not present
    const requestId = request.headers['x-request-id'] as string || 
                     request.headers['x-correlation-id'] as string || 
                     this.generateRequestId();
    
    // Set request ID in response headers
    response.setHeader('X-Request-ID', requestId);
    
    // Get API version from request
    const version = request.headers['api-version'] as string || 
                   request.url.match(/\/v(\d+)\//)?.[1] || '1';

    return next.handle().pipe(
      map((data: T | PaginatedResponse<T>) => {
        const statusCode = response.statusCode || HttpStatus.OK;
        const isSuccess = statusCode >= 200 && statusCode < 300;
        
        // Check if response is paginated
        const isPaginated = this.isPaginatedResponse(data);
        
        // Build base response
        const apiResponse: ApiResponse<T> = {
          success: isSuccess,
          statusCode,
          message: this.getResponseMessage(context, statusCode, isSuccess),
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
            version: `v${version}`,
            path: request.url,
            method: request.method,
          },
        };

        if (isPaginated) {
          const paginatedData = data as PaginatedResponse<T>;
          apiResponse.data = paginatedData.data as T;
          apiResponse.meta = {
            ...apiResponse.meta,
            ...paginatedData.pagination,
          };
          
          // Set pagination headers
          this.setPaginationHeaders(response, paginatedData.pagination);
        } else {
          apiResponse.data = data;
        }

        // Handle array responses
        if (Array.isArray(data) && !isPaginated) {
          apiResponse.meta.totalCount = data.length;
        }

        // Set response time header
        const responseTime = this.getResponseTime(request);
        if (responseTime) {
          response.setHeader('X-Response-Time', `${responseTime}ms`);
          apiResponse.meta = {
            ...apiResponse.meta,
            responseTime: `${responseTime}ms`,
          };
        }

        // Set cache headers for GET requests
        if (request.method === 'GET' && isSuccess) {
          this.setCacheHeaders(response, context);
        }

        return apiResponse;
      }),
    );
  }

  private isPaginatedResponse<T>(data: any): data is PaginatedResponse<T> {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.data) &&
      data.pagination &&
      typeof data.pagination === 'object' &&
      typeof data.pagination.totalCount === 'number' &&
      typeof data.pagination.currentPage === 'number' &&
      typeof data.pagination.perPage === 'number'
    );
  }

  private getResponseMessage(
    context: ExecutionContext,
    statusCode: number,
    isSuccess: boolean,
  ): string {
    const handler = context.getHandler();
    
    // Check for custom message from metadata
    const customMessage = this.reflector.get<string>('response_message', handler);
    if (customMessage) {
      return customMessage;
    }

    // Generate default messages based on HTTP method and status
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const resource = this.extractResourceFromPath(request.url);

    if (!isSuccess) {
      return this.getErrorMessage(statusCode);
    }

    switch (method) {
      case 'GET':
        return Array.isArray(request.query) || request.url.includes('?')
          ? `${resource} retrieved successfully`
          : `${resource} retrieved successfully`;
      case 'POST':
        return `${resource} created successfully`;
      case 'PUT':
      case 'PATCH':
        return `${resource} updated successfully`;
      case 'DELETE':
        return `${resource} deleted successfully`;
      default:
        return 'Request processed successfully';
    }
  }

  private extractResourceFromPath(url: string): string {
    // Extract resource name from URL path
    const pathSegments = url.split('/').filter(segment => segment && !segment.match(/^v\d+$/));
    const resource = pathSegments[pathSegments.length - 2] || pathSegments[pathSegments.length - 1] || 'Resource';
    
    // Capitalize and singularize/pluralize appropriately
    return resource.charAt(0).toUpperCase() + resource.slice(1).toLowerCase();
  }

  private getErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'Invalid request parameters';
      case HttpStatus.UNAUTHORIZED:
        return 'Authentication required';
      case HttpStatus.FORBIDDEN:
        return 'Access denied';
      case HttpStatus.NOT_FOUND:
        return 'Resource not found';
      case HttpStatus.CONFLICT:
        return 'Resource conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Validation failed';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Rate limit exceeded';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal server error';
      case HttpStatus.BAD_GATEWAY:
        return 'Service unavailable';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service temporarily unavailable';
      default:
        return 'Request failed';
    }
  }

  private setPaginationHeaders(response: Response, pagination: PaginationMeta): void {
    response.setHeader('X-Total-Count', pagination.totalCount.toString());
    response.setHeader('X-Page-Count', pagination.pageCount.toString());
    response.setHeader('X-Current-Page', pagination.currentPage.toString());
    response.setHeader('X-Per-Page', pagination.perPage.toString());
    response.setHeader('X-Has-Next-Page', pagination.hasNextPage.toString());
    response.setHeader('X-Has-Previous-Page', pagination.hasPreviousPage.toString());
  }

  private setCacheHeaders(response: Response, context: ExecutionContext): void {
    const handler = context.getHandler();
    const cacheControl = this.reflector.get<string>('cache_control', handler);
    
    if (cacheControl) {
      response.setHeader('Cache-Control', cacheControl);
    } else {
      // Default cache control for GET requests
      response.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    }
    
    // Set ETag for caching
    const etag = this.reflector.get<string>('etag', handler);
    if (etag) {
      response.setHeader('ETag', etag);
    }
  }

  private getResponseTime(request: Request): number | null {
    const startTime = (request as any).startTime;
    if (startTime) {
      return Date.now() - startTime;
    }
    return null;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}