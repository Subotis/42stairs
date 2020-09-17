import { LoggerService, Inject } from '@nestjs/common';
import {
    Configuration,
    Logger as Logger4js,
    configure,
    getLogger,
    addLayout,
} from 'log4js';
import * as _ from 'underscore';
import { ConfigService } from '../config/config.service';
import { LogLevel } from '../../enums/log.level';

export class MyLogger implements LoggerService {
    private readonly accessLogger: Logger4js;

    private readonly errorLogger: Logger4js;

    private readonly commonLogger: Logger4js;


    constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) {
        addLayout('jsonLayout', config => (logEvent: any) => JSON.stringify({
            dateTime: logEvent.startTime,
            level: logEvent.level.levelStr,
            message: logEvent.data,
            context: logEvent.context,
        }) + config.separator);
        configure(this.configService.get('log4js') as Configuration);
        this.commonLogger = getLogger();
        this.accessLogger = getLogger('access');
        this.errorLogger = getLogger('error');
    }

    access(
        request: any,
        responseStatus: {
            statusMessage: string,
            statusCode: number,
            errorMessage?: string,
            trace?: any,
        },
        executionTime: number = 0,
    ) {
        request.body = _.omit(request.body, ['password', 'passwordConfirmation']);

        const message: any = {
            responseStatus,
            header: {
                host: request.headers.host,
                authorization: request.headers.authorization,
                method: request.method,
                userAgent: request.headers['user-agent'],
            },
            url: request.originalUrl,
            query: request.query,
            body: request.body,
            executionTime: executionTime > 0 ? Date.now() - executionTime : 0,
        };

        this.accessLogger.info(message);
    }


    error(message: string, error: any, level: any | LogLevel = LogLevel.ERROR) {
        const errorToSend: any = {};
        if (typeof error === 'object') {
            if (error.stack && error.stack.length) {
                errorToSend.stack = error.stack;
            }
            if (error.message && error.message.length) {
                errorToSend.message = error.message;
            }
            errorToSend.source = error;
        }
        this.errorLogger[level](JSON.stringify({ message, error: errorToSend }, this.getCircularReplacer()));
    }

    log(message: string) {
        this.commonLogger.info(message);
    }

    warn(message: string) {
        this.errorLogger.warn(message);
    }

    private getCircularReplacer() {
        const seen = new WeakSet();

        return (key: any, value: string): any => {
            try {
                if (value && typeof value === 'object') {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }

                return value; //eslint-disable-line consistent-return
            } catch (e) {

            }
        };
    }
}
