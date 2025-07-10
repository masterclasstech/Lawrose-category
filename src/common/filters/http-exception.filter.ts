/* eslint-disable prettier/prettier */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
  details?: any;
  requestId?: string;
  correlationId?: string;
}

@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // Extract request information
    const requestId = request.headers['x-request-id'] as string || this.generateRequestId();
    const correlationId = request.headers['x-correlation-id'] as string || requestId;
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const clientIp = this.getClientIp(request);

    // Get exception response
    const exceptionResponse = exception.getResponse();
    const message = this.extractMessage(exceptionResponse);
    const error = this.getErrorType(status);

    // Build error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      requestId,
      correlationId,
    };

    // Add details in development mode
    if (this.configService.get('NODE_ENV') === 'development') {
      errorResponse.details = {
        stack: exception.stack,
        cause: exception.cause,
        userAgent,
        clientIp,
        headers: this.sanitizeHeaders(request.headers),
        query: request.query,
        params: request.params,
        body: this.sanitizeBody(request.body),
      };
    }

    // Log the error
    this.logError(exception, request, status, requestId, correlationId, clientIp, userAgent);

    // Set response headers
    response.setHeader('X-Request-ID', requestId);
    response.setHeader('X-Correlation-ID', correlationId);
    response.setHeader('X-Error-Type', error);
    response.setHeader('X-Timestamp', errorResponse.timestamp);

    // Send response
    response.status(status).json(errorResponse);
  }

  private extractMessage(exceptionResponse: any): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object') {
      if (exceptionResponse.message) {
        return exceptionResponse.message;
      }
      if (exceptionResponse.error) {
        return exceptionResponse.error;
      }
      if (Array.isArray(exceptionResponse)) {
        return exceptionResponse;
      }
      return JSON.stringify(exceptionResponse);
    }

    return 'Internal server error';
  }

  private getErrorType(status: number): string {
    const errorTypes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
      [HttpStatus.NOT_ACCEPTABLE]: 'Not Acceptable',
      [HttpStatus.REQUEST_TIMEOUT]: 'Request Timeout',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.GONE]: 'Gone',
      [HttpStatus.LENGTH_REQUIRED]: 'Length Required',
      [HttpStatus.PRECONDITION_FAILED]: 'Precondition Failed',
      [HttpStatus.PAYLOAD_TOO_LARGE]: 'Payload Too Large',
      [HttpStatus.URI_TOO_LONG]: 'URI Too Long',
      [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
      // [HttpStatus.RANGE_NOT_SATISFIABLE]: 'Range Not Satisfiable', // Removed: Not defined in HttpStatus
      [HttpStatus.EXPECTATION_FAILED]: 'Expectation Failed',
      [HttpStatus.I_AM_A_TEAPOT]: 'I Am A Teapot',
      // [HttpStatus.MISDIRECTED_REQUEST]: 'Misdirected Request', // Removed: Not defined in HttpStatus
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      //[HttpStatus.LOCKED]: 'Locked',
      [HttpStatus.FAILED_DEPENDENCY]: 'Failed Dependency',
      //[HttpStatus.TOO_EARLY]: 'Too Early',
      //[HttpStatus.UPGRADE_REQUIRED]: 'Upgrade Required',
      [HttpStatus.PRECONDITION_REQUIRED]: 'Precondition Required',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
      //[HttpStatus.REQUEST_HEADER_FIELDS_TOO_LARGE]: 'Request Header Fields Too Large',
      //[HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS]: 'Unavailable For Legal Reasons',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [HttpStatus.NOT_IMPLEMENTED]: 'Not Implemented',
      [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
      [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
      [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP Version Not Supported',
      //[HttpStatus.VARIANT_ALSO_NEGOTIATES]: 'Variant Also Negotiates',
      //[HttpStatus.INSUFFICIENT_STORAGE]: 'Insufficient Storage',
      //[HttpStatus.LOOP_DETECTED]: 'Loop Detected',
      //[HttpStatus.NOT_EXTENDED]: 'Not Extended',
      //[HttpStatus.NETWORK_AUTHENTICATION_REQUIRED]: 'Network Authentication Required',
    };

    return errorTypes[status] || 'Unknown Error';
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
      'pass',
      'pwd',
      'ssn',
      'socialSecurityNumber',
      'creditCard',
      'cardNumber',
      'cvv',
      'pin',
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

  private logError(
    exception: HttpException,
    request: Request,
    status: number,
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
      statusCode: status,
      clientIp,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} Error: ${exception.message}`,
        exception.stack,
        JSON.stringify(context, null, 2),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `HTTP ${status} Warning: ${exception.message}`,
        JSON.stringify(context, null, 2),
      );
    } else {
      this.logger.log(
        `HTTP ${status} Info: ${exception.message}`,
        JSON.stringify(context, null, 2),
      );
    }
  }
}