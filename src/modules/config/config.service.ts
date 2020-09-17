import * as dotenv from 'dotenv';
import * as Joi from '@hapi/joi';
import { readdirSync } from 'fs';
import * as path from 'path';
import { get } from 'lodash';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { Environments } from '../../enums/environments';


export interface EnvConfig {
    [key: string]: any,
}

export class ConfigService {
    private static envConfig: EnvConfig;
    private static readonly configDir: string = '/configs/';


    constructor(config: EnvConfig) {
        ConfigService.envConfig = config;
    }

    public static async load(filePath: string): Promise<ConfigService> {
        const { configs } = await this.loadConfigAsync(filePath);

        return new ConfigService(configs);
    }

    /**validate environment variables*/
    private static validateInput(envConfig: EnvConfig): EnvConfig {
        const envVarsSchema: Joi.ObjectSchema = Joi.object({
            PORT: Joi.any().default(3000),
            MONGODB_URI: Joi.string().required(),
            ENV_NAME: Joi.string().required(),
            MONGODB_PASSWORD: Joi.string().required(),
            MONGODB_USERNAME: Joi.string().required(),
        })
        const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig, { allowUnknown: true });
        if (error) {
            throw new RuntimeException(`Config validation error: ${error.message}`);
        }

        return validatedEnvConfig;
    }

    private static getParsedConfigurations(filePath: string): EnvConfig {
        let parseConf: EnvConfig;
        !process.env.NODE_ENV && (process.env.NODE_ENV = Environments.DEV);
        if (process.env.NODE_ENV === Environments.DEV) {
            parseConf = dotenv.config({ path: filePath });
            if (parseConf.error) {
                throw new RuntimeException(`Dotenv error: ${parseConf.error}`);
            }
            parseConf = parseConf.parsed;
        } else {
            parseConf = process.env;
        }

        return parseConf;
    }

    private static async loadConfigAsync(filePath: string): Promise<{ configs: EnvConfig }> {
        const matches = readdirSync(`${__dirname}${this.configDir}`);
        const parseConf: EnvConfig = ConfigService.getParsedConfigurations(filePath);
        let configs: EnvConfig = this.validateInput(parseConf);
        configs = this.configGrab(matches, configs);

        return { configs };
    }


    protected static configGrab(
        configPaths: string[],
        initValue: EnvConfig,
    ): EnvConfig {
        const configPathSchema: Joi.ArraySchema = Joi.array()
            .items(
                Joi.string()
                    .valid('log4js.js', 'log4js.ts')
                    .required(),
                Joi.string()
                    .valid('mongoDB.js', 'mongoDB.ts')
                    .required(),
            )
            .required();

        const { error } = configPathSchema.validate(configPaths);

        if (error) {
            throw new RuntimeException(`Config path validation error: ${error.message}`);
        }

        return configPaths.reduce(
            (configs: EnvConfig, file: string) => {
                if (!/(\.js|\.ts)$/.test(file)) {
                    return configs;
                }
                const module = require(`.${this.configDir}${file}`); // eslint-disable-line
                const config: EnvConfig = module.default || module;
                const configName: string = this.getConfigName(file);

                configs[configName] = config;

                return configs;
            },
            { core: initValue },
        );
    }

    protected static getConfigName(file: string): string {
        const last: string | undefined = file.split(path.posix.sep).pop();

        if (!last) {
            return '';
        }

        return last
            .replace('.js', '')
            .replace('.ts', '');
    }

    public get(
        params: string | string[],
        value?: any,
    ): any {
        return ConfigService.get(params, value);
    }

    static get(
        params: string | string[],
        value?: any,
    ): string | EnvConfig | undefined {
        if (!Array.isArray(params)) {
            params = [params];
        }

        let configValue: EnvConfig | undefined | string = ConfigService.envConfig;
        params.forEach(param => { configValue !== undefined && (configValue = get(configValue, param)); });

        if (configValue === undefined) {
            configValue = value;
        }

        return configValue;
    }

}
