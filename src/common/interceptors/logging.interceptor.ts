/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';

export interface RequestLog {
  requestId: string;
  method: string;
  url: string;
  path: string;
  query: any;
  params: any;
  body?: any;
  headers: Record<string, string>;
  userAgent?: string;
  ip: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  apiVersion?: string;
  contentLength?: number;
}

export interface ResponseLog {
  requestId: string;
  statusCode: number;
  statusMessage: string;
  responseTime: number;
  contentLength?: number;
  timestamp: string;
  success: boolean;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface FullRequestLog extends RequestLog {
  response: Omit<ResponseLog, 'requestId'>;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly sensitiveFields = [
    'password',
    'token',
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'refresh_token',
    'access_token',
    'secret',
    'apiKey',
    'api_key',
    'client_secret',
    'clientSecret',
  ];

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    // Generate or extract request ID
    const requestId = this.getRequestId(request);
    
    // Set request ID in request object for other interceptors
    (request as any).requestId = requestId;
    (request as any).startTime = startTime;
    
    // Set request ID in response headers
    response.setHeader('X-Request-ID', requestId);
    
    // Check if logging is disabled for this route
    const skipLogging = this.reflector.get<boolean>('skip_logging', context.getHandler());
    if (skipLogging) {
      return next.handle();
    }
    
    // Log incoming request
    const requestLog = this.createRequestLog(request, requestId, startTime);
    this.logRequest(requestLog);
    
    return next.handle().pipe(
      tap((data) => {
        // Log successful response
        const responseTime = Date.now() - startTime;
        const responseLog = this.createResponseLog(
          requestId,
          response.statusCode,
          responseTime,
          true,
        );
        this.logResponse(responseLog, data);
      }),
      catchError((error) => {
        // Log error response
        const responseTime = Date.now() - startTime;
        const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const responseLog = this.createResponseLog(
          requestId,
          statusCode,
          responseTime,
          false,
          error,
        );
        this.logError(responseLog, error);
        
        return throwError(() => error);
      }),
      finalize(() => {
        // Log request completion
        const responseTime = Date.now() - startTime;
        this.logRequestCompletion(requestId, responseTime);
      }),
    );
  }

  private getRequestId(request: Request): string {
    return (
      (request.headers['x-request-id'] as string) ||
      (request.headers['x-correlation-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
  }

  private createRequestLog(
    request: Request,
    requestId: string,
    startTime: number,
  ): RequestLog {
    const body = this.sanitizeObject(request.body);
    const headers = this.sanitizeHeaders(request.headers);
    
    return {
      requestId,
      method: request.method,
      url: request.url,
      path: request.path,
      query: request.query,
      params: request.params,
      body: Object.keys(body).length > 0 ? body : undefined,
      headers,
      userAgent: request.get('user-agent'),
      ip: this.getClientIp(request),
      timestamp: new Date(startTime).toISOString(),
      userId: this.extractUserId(request),
      sessionId: this.extractSessionId(request),
      apiVersion: this.extractApiVersion(request),
      contentLength: parseInt(request.get('content-length') || '0', 10) || undefined,
    };
  }

  private createResponseLog(
    requestId: string,
    statusCode: number,
    responseTime: number,
    success: boolean,
    error?: any,
  ): ResponseLog {
    return {
      requestId,
      statusCode,
      statusMessage: this.getStatusMessage(statusCode),
      responseTime,
      timestamp: new Date().toISOString(),
      success,
      error: error
        ? {
            name: error.name || 'Error',
            message: error.message || 'Unknown error',
            stack: error.stack,
          }
        : undefined,
    };
  }

  private logRequest(requestLog: RequestLog): void {
    const { method, path, requestId, ip, userAgent, apiVersion } = requestLog;
    
    // Log basic request info
    this.logger.log(
      `📨 ${method} ${path} - ${requestId} - ${ip} - ${userAgent} - API v${apiVersion}`,
    );
    
    // Log detailed request in debug mode
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Request Details: ${JSON.stringify(requestLog, null, 2)}`);
    }
    
    // Log request body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && requestLog.body) {
      this.logger.log(`Request Body [${requestId}]: ${JSON.stringify(requestLog.body)}`);
    }
    
    // Log query parameters if present
    if (Object.keys(requestLog.query).length > 0) {
      this.logger.log(`Query Params [${requestId}]: ${JSON.stringify(requestLog.query)}`);
    }
  }

  private logResponse(responseLog: ResponseLog, data?: any): void {
    const { requestId, statusCode, responseTime, success } = responseLog;
    const emoji = success ? '' : '';
    
    this.logger.log(
      `${emoji} ${statusCode} - ${requestId} - ${responseTime}ms`,
    );
    
    // Log response data in debug mode
    if (process.env.NODE_ENV === 'development' && data) {
      this.logger.debug(`Response Data [${requestId}]: ${JSON.stringify(data)}`);
    }
    
    // Log slow requests
    if (responseTime > 1000) {
      this.logger.warn(`🐌 Slow Request [${requestId}]: ${responseTime}ms`);
    }
  }

  private logError(responseLog: ResponseLog, error: any): void {
    const { requestId, statusCode, responseTime, error: errorInfo } = responseLog;
    
    this.logger.error(
      ` ${statusCode} - ${requestId} - ${responseTime}ms - ${errorInfo?.message}`,
    );
    
    // Log error stack in development
    if (process.env.NODE_ENV === 'development' && errorInfo?.stack) {
      this.logger.error(`Error Stack [${requestId}]: ${errorInfo.stack}`);
    }
    
    // Log error details
    if (error.response) {
      this.logger.error(
        `Error Response [${requestId}]: ${JSON.stringify(error.response)}`,
      );
    }
  }

  private logRequestCompletion(requestId: string, responseTime: number): void {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(` Request Completed [${requestId}] - Total Time: ${responseTime}ms`);
    }
  }

  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const sanitized = { ...obj };
    
    for (const key in sanitized) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }
    
    return sanitized;
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = String(value);
      }
    }
    
    return sanitized;
  }

  private isSensitiveField(fieldName: string): boolean {
    const lowerFieldName = fieldName.toLowerCase();
    return this.sensitiveFields.some(sensitive => 
      lowerFieldName.includes(sensitive.toLowerCase())
    );
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  private extractUserId(request: Request): string | undefined {
    // Extract user ID from JWT token or request context
    const user = (request as any).user;
    return user?.id || user?.userId || user?.sub;
  }

  private extractSessionId(request: Request): string | undefined {
    // Extract session ID from headers or cookies
    return (
      (request.headers['x-session-id'] as string) ||
      (request as any).sessionID ||
      undefined
    );
  }

  private extractApiVersion(request: Request): string {
    return (
      (request.headers['api-version'] as string) ||
      request.url.match(/\/v(\d+)\//)?.[1] ||
      '1'
    );
  }

  private getStatusMessage(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.OK:
        return 'OK';
      case HttpStatus.CREATED:
        return 'Created';
      case HttpStatus.NO_CONTENT:
        return 'No Content';
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      case HttpStatus.BAD_GATEWAY:
        return 'Bad Gateway';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      default:
        return 'Unknown Status';
    }
  }
}