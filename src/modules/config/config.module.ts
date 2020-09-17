import {
    DynamicModule,
    Module,
    Global,
} from '@nestjs/common';
import { ConfigService } from './config.service';

@Global()
@Module({})
export class ConfigModule {
    static load(filePath: string): DynamicModule {
        const configProvider = {
            provide: ConfigService,
            useFactory: async (): Promise<ConfigService> => ConfigService.load(filePath),
        };

        return {
            module: ConfigModule,
            providers: [configProvider],
            exports: [configProvider],
        };
    }
}
