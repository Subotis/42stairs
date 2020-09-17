import { Global, HttpModule, Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { RootService } from './root.service';
import { RootController } from './root.controller';
import { ProxyModule } from "../proxy/proxy.module";


@Global()
@Module({
    imports: [
        LoggerModule,
        HttpModule,
        ProxyModule
    ],
    providers: [
        RootService,
    ],
    exports: [
        RootService,
    ],
    controllers: [
        RootController,
    ],
})
export class RootModule {
}
