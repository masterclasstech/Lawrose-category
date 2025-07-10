/* eslint-disable prettier/prettier */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { MongoError } from 'mongodb';

interface MongoErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
  errorCode?: number;
  errorType: string;
  details?: any;
  requestId?: string;
  correlationId?: string;
}

@Injectable()
@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Extract request information
    const requestId = request.headers['x-request-id'] as string || this.generateRequestId();
    const correlationId = request.headers['x-correlation-id'] as string || requestId;
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const clientIp = this.getClientIp(request);

    // Map MongoDB error to HTTP status
    const { statusCode, message, errorType } = this.mapMongoErrorToHttp(exception);

    // Build error response
    const errorResponse: MongoErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: this.getErrorName(statusCode),
      errorCode: typeof exception.code === 'number' ? exception.code : undefined,
      errorType,
      requestId,
      correlationId,
    };

    // Add details in development mode
    if (this.configService.get('NODE_ENV') === 'development') {
      errorResponse.details = {
        originalError: {
          name: exception.name,
          code: exception.code,
          codeName: (exception as any).codeName,
          stack: exception.stack,
        },
        mongoDetails: this.extractMongoDetails(exception),
        request: {
          userAgent,
          clientIp,
          headers: this.sanitizeHeaders(request.headers),
          query: request.query,
          params: request.params,
          body: this.sanitizeBody(request.body),
        },
      };
    }

    // Log the error
    this.logMongoError(exception, request, statusCode, requestId, correlationId, clientIp, userAgent);

    // Set response headers
    response.setHeader('X-Request-ID', requestId);
    response.setHeader('X-Correlation-ID', correlationId);
    response.setHeader('X-Error-Type', errorType);
    response.setHeader('X-Timestamp', errorResponse.timestamp);

    // Send response
    response.status(statusCode).json(errorResponse);
  }

  private mapMongoErrorToHttp(exception: MongoError): {
    statusCode: number;
    message: string;
    errorType: string;
  } {
    const errorCode = exception.code;
    const errorMessage = exception.message;

    // MongoDB Error Code Mappings
    switch (errorCode) {
      // Duplicate Key Error
      case 11000:
      case 11001:
        return {
          statusCode: HttpStatus.CONFLICT,
          message: this.extractDuplicateKeyMessage(errorMessage),
          errorType: 'DUPLICATE_KEY_ERROR',
        };

      // Authentication errors
      case 13:
      case 18:
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Authentication failed',
          errorType: 'AUTHENTICATION_ERROR',
        };

      // Authorization errors
      case 16:
      case 33:
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Insufficient permissions',
          errorType: 'AUTHORIZATION_ERROR',
        };

      // Document not found
      case 47:
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Document not found',
          errorType: 'DOCUMENT_NOT_FOUND',
        };

      // Validation errors
      case 121:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Document validation failed',
          errorType: 'VALIDATION_ERROR',
        };

      // Index errors
      case 85:
      case 86:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Index operation failed',
          errorType: 'INDEX_ERROR',
        };

      // Transaction errors
      case 112:
      case 244:
      case 251:
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Transaction operation failed',
          errorType: 'TRANSACTION_ERROR',
        };

      // Connection errors
      case 6:
      case 7:
      case 89:
        return {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Database connection failed',
          errorType: 'CONNECTION_ERROR',
        };

      // Write concern errors
      case 64:
      case 79:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Write operation failed',
          errorType: 'WRITE_CONCERN_ERROR',
        };

      // Query errors
      case 2:
      case 31:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid query operation',
          errorType: 'QUERY_ERROR',
        };

      // Timeout errors
      case 50:
      case 262:
        return {
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          message: 'Operation timed out',
          errorType: 'TIMEOUT_ERROR',
        };

      // Resource errors
      case 8:
      case 267:
        return {
          statusCode: 507, // 507 Insufficient Storage
          message: 'Insufficient storage space',
          errorType: 'RESOURCE_ERROR',
        };

      // Network errors
      case 89:
      case 6:
        return {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: 'Network error occurred',
          errorType: 'NETWORK_ERROR',
        };

      // Default case for unknown errors
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: this.sanitizeErrorMessage(errorMessage),
          errorType: 'UNKNOWN_MONGO_ERROR',
        };
    }
  }

  private extractDuplicateKeyMessage(errorMessage: string): string {
    // Extract field name from duplicate key error
    const fieldMatch = errorMessage.match(/index: (\w+)/);
    const valueMatch = errorMessage.match(/dup key: { (.+) }/);
    
    if (fieldMatch && fieldMatch[1]) {
      const fieldName = fieldMatch[1].replace(/_\d+$/, ''); // Remove index suffix
      return `A record with this ${fieldName} already exists`;
    }

    if (valueMatch && valueMatch[1]) {
      return `Duplicate value found: ${valueMatch[1]}`;
    }

    return 'A record with these values already exists';
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages
    const sensitivePatterns = [
      /password:\s*"[^"]*"/gi,
      /token:\s*"[^"]*"/gi,
      /key:\s*"[^"]*"/gi,
      /secret:\s*"[^"]*"/gi,
      /apikey:\s*"[^"]*"/gi,
    ];

    let sanitizedMessage = message;
    sensitivePatterns.forEach(pattern => {
      sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]');
    });

    return sanitizedMessage;
  }

  private extractMongoDetails(exception: MongoError): any {
    const details: any = {
      errorCode: exception.code,
      errorCodeName: (exception as any)?.codeName,
      errorName: exception.name,
    };

    // Extract additional details based on error type
    if (exception.code === 11000 || exception.code === 11001) {
      // Duplicate key error details
      const keyPattern = exception.message.match(/collection: (\w+\.\w+)/);
      const indexPattern = exception.message.match(/index: (\w+)/);
      
      if (keyPattern) {
        details.collection = keyPattern[1];
      }
      if (indexPattern) {
        details.index = indexPattern[1];
      }
    }

    // Add any additional properties from the error
    if (exception.errorLabels) {
      details.errorLabels = exception.errorLabels;
    }

    return details;
  }

  private getErrorName(statusCode: number): string {
    const errorNames: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.REQUEST_TIMEOUT]: 'Request Timeout',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
      [507]: 'Insufficient Storage', // 507 Insufficient Storage
    };

    return errorNames[statusCode] || 'Unknown Error';
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'] as string;
    const realIp = request.headers['x-real-ip'] as string;
    const clientIp = request.connection?.remoteAddress || request.socket?.remoteAddress;

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return realIp || clientIp || 'unknown';
  }

  private sanitizeHeaders(headers: any): any {
    const sanitizedHeaders = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = [
      'authorization',
      'x-api-key',
      'cookie',
      'set-cookie',
      'x-auth-token',
      'x-access-token',
      'x-refresh-token',
      'proxy-authorization',
    ];

    sensitiveHeaders.forEach(header => {
      if (sanitizedHeaders[header]) {
        sanitizedHeaders[header] = '[REDACTED]';
      }
    });

    return sanitizedHeaders;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitizedBody = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'key',
      'auth',
      'authorization',
      'credential',
      'credentials',
    ];

    const sanitizeObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }

      if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase();
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            sanitized[key] = '[REDACTED]';
          } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      }

      return obj;
    };

    return sanitizeObject(sanitizedBody);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logMongoError(
    exception: MongoError,
    request: Request,
    statusCode: number,
    requestId: string,
    correlationId: string,
    clientIp: string,
    userAgent: string,
  ) {
    const context = {
      requestId,
      correlationId,
      method: request.method,
      url: request.url,
      statusCode,
      clientIp,
      userAgent,
      mongoError: {
        code: exception.code,
        codeName: (exception as any)?.codeName,
        name: exception.name,
      },
      timestamp: new Date().toISOString(),
    };

    if (statusCode >= 500) {
      this.logger.error(
        `MongoDB Error [${exception.code}]: ${exception.message}`,
        exception.stack,
        JSON.stringify(context, null, 2),
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `MongoDB Warning [${exception.code}]: ${exception.message}`,
        JSON.stringify(context, null, 2),
      );
    } else {
      this.logger.log(
        `MongoDB Info [${exception.code}]: ${exception.message}`,
        JSON.stringify(context, null, 2),
      );
    }
  }
}