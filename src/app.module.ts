import { Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';
import { LoggerModule } from './modules/logger/logger.module';
import { RootModule } from "./modules/root/root.module";


@Module({
  imports: [
    ConfigModule.load('./.env'),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => config.get('mongoDB'),
      inject: [ConfigService],
    }),
    LoggerModule,
      RootModule,
  ],
})
export class AppModule {
  constructor(
    @InjectConnection() public readonly connection: any,
) {
}}
