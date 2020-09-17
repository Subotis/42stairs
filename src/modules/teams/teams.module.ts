import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from '../logger/logger.module';
import { TeamsService } from './teams.service';
import { DbModelNames } from '../../enums/db.model.names';
import { teamsSchema } from "../../schemes/teams.schema";
import { TeamsController } from "./teams.controller";

@Module(
    {
        imports: [
            MongooseModule.forFeature([
                { name: DbModelNames.TEAMS, schema: teamsSchema },
            ]),
            LoggerModule,
        ],
        exports: [
            TeamsService,
        ],
        providers: [
            TeamsService,
        ],
        controllers: [
            TeamsController,
        ],
    },
)
export class TeamsModule {}
