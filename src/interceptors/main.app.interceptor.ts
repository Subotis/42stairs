import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    Inject,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { MyLogger } from '../modules/logger/logger.service';

@Injectable()
export class MainAppInterceptor implements NestInterceptor {
    constructor(@Inject(MyLogger) private readonly logger: MyLogger) {
    }

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        const http: HttpArgumentsHost = context.switchToHttp();
        const request = http.getRequest();
        const response = http.getResponse();
        const executionTime = Date.now();

        return next
            .handle()
            .pipe(
                tap(() => this.logger.access(
                    request,
                    {
                        statusMessage: 'OK',
                        statusCode: response.statusCode,
                    },
                    executionTime,
                )),
            );
    }
}
