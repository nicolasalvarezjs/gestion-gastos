import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { body?: unknown; params?: unknown; query?: unknown }>();
    const res = http.getResponse<{ statusCode?: number }>();

    const requestLog = {
      method: (req as unknown as { method?: string }).method,
      url: (req as unknown as { originalUrl?: string; url?: string }).originalUrl ??
        (req as unknown as { url?: string }).url,
      params: (req as unknown as { params?: unknown }).params,
      query: (req as unknown as { query?: unknown }).query,
      body: (req as unknown as { body?: unknown }).body
    };

    this.logger.log(`Request ${this.safeStringify(requestLog)}`);

    return next.handle().pipe(
      tap((data) => {
        const statusCode = res.statusCode ?? 200;
        const responseLog = {
          statusCode,
          ok: statusCode >= 200 && statusCode < 300,
          response: data
        };
        this.logger.log(`Response ${this.safeStringify(responseLog)}`);
      }),
      catchError((error) => {
        const statusCode = error instanceof HttpException ? error.getStatus() : 500;
        const response =
          error instanceof HttpException ? error.getResponse() : { message: error?.message };
        const errorLog = {
          statusCode,
          ok: false,
          response
        };
        this.logger.error(`Response ${this.safeStringify(errorLog)}`);
        throw error;
      })
    );
  }

  private safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return '"[unserializable]"';
    }
  }
}
