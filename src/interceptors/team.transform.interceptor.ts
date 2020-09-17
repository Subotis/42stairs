import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as apiTransformer from "../helpers/transformers/api.transformer";

@Injectable()
export class TeamTransformInterceptor implements NestInterceptor {

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {

        return next
            .handle()
            .pipe(
                map(async (controllerResponse: any) => {
                    return apiTransformer.transformTeam(controllerResponse);
                }),
            );
    }
}
