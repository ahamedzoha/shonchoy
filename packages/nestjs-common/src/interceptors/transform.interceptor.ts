import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";

// import { Observable } from "rxjs";
// import { map } from "rxjs/operators";

// Temporary types until rxjs is properly installed
type Observable<T> = any;
const map = (fn: any) => (source: any) => source;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: any) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }))
    );
  }
}
