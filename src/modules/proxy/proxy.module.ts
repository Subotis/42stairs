import { Global, HttpModule, Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { TeamsModule } from '../teams/teams.module'
import { MatchesModule } from '../matches/matches.module'
import { ProxyService } from "./proxy.service";

@Global()
@Module({
    imports: [
        TeamsModule,
        MatchesModule,
        LoggerModule,
        HttpModule
    ],
    providers: [
        ProxyService,
    ],
    exports: [
        ProxyService,
    ],
    controllers: [

    ],
})
export class ProxyModule {
}
