import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from '../logger/logger.module';
import { MatchesService } from './matches.service';
import { DbModelNames } from '../../enums/db.model.names';
import { matchesSchema } from "../../schemes/matches.schema";
import { MatchesController } from "./matches.controller";

@Module(
    {
        imports: [
            MongooseModule.forFeature([
                { name: DbModelNames.MATCHES, schema: matchesSchema },
            ]),
            LoggerModule
        ],
        exports: [
            MatchesService,
        ],
        providers: [
            MatchesService,
        ],
        controllers: [
            MatchesController
        ],
    },
)
export class MatchesModule {}
